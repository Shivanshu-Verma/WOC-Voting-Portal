import "dotenv/config";
import express from "express";
import { connectDB, sequelize } from "../db/db.js";
import { EVM } from "../models/EVM.js";
import { Commitment } from "../models/Commitments.js";
import {
  authenticateUser,
  verifierIsStaff,
} from "../middlewares/auth.middleware.js";
import { decryptMiddleware } from "../middlewares/decryption.middleware.js";
import { Op } from "sequelize";

(async () => {
  try {
    // Connect to PostgreSQL and sync models
    await connectDB();
    console.log("Database connected successfully!");

    const app = express();
    app.use(express.json());
    const processedEVMs = new Set();

    app.post(
      "/send-vecs",
      authenticateUser,
      verifierIsStaff,
      decryptMiddleware,
      async (req, res) => {
        const evmId = req.evm.id;
        const { randomVector } = req.body;

        if (
          !Array.isArray(randomVector) ||
          randomVector.some(
            (entry) =>
              typeof entry !== "object" ||
              !entry.position ||
              !entry.randomVector ||
              !entry.randomVector
                .split(",")
                .every((val) => !isNaN(parseInt(val, 10)))
          )
        ) {
          return res
            .status(400)
            .json({ error: "Invalid randomVector format." });
        }

        if (processedEVMs.has(evmId)) {
          return res.status(200).json({ message: "EVM already processed." });
        }

        const evm = await EVM.findByPk(evmId);
        if (!evm) {
          return res.status(404).json({ error: "EVM not found." });
        }

        // Store the random vector in the set without updating the database
        processedEVMs.add(evmId);
        res.status(200).json({ message: "Checkpoint successful." });
      }
    );

    const server = app.listen(6969, () => {
      console.log("Result route open on port", 6969);
    });

    setTimeout(async () => {
      console.log("Calculating election results...");

      // Step 1: Fetch all EVMs
      const evms = await EVM.findAll();

      // Step 2: Collect all voters in buffers
      const votersInBuffer = [];
      for (const evm of evms) {
        if (evm.buffer && Array.isArray(evm.buffer)) {
          votersInBuffer.push(...evm.buffer);
        }
      }

      console.log("voters in buffer = ", votersInBuffer);

      // Step 3: Prepare summation of random vectors by position
      const summedRandomVectors = {};

      // Sum up random vectors for each position across all EVMs
      for (const evm of evms) {
        if (evm.randomVector && Array.isArray(evm.randomVector)) {
          evm.randomVector.forEach(({ position, randomVector }) => {
            const vectorArray = JSON.parse(randomVector);
            console.log("vectorArray = ", vectorArray);
            if (!summedRandomVectors[position]) {
              summedRandomVectors[position] = Array(vectorArray.length).fill(0);
            }
            summedRandomVectors[position] = summedRandomVectors[position].map(
              (sum, index) => sum + (vectorArray[index] || 0)
            );
            console.log("position = ", position);
            console.log(
              "summedRandomVectors = ",
              summedRandomVectors[position]
            );
          });
        }
      }

      // Step 4: Get all commitments excluding those from voters in buffer
      const voterIdsInBuffer = votersInBuffer.map((voter) => voter.voter);

      console.log(voterIdsInBuffer);

      const commitments = await Commitment.findAll({
        where: {
          voter: {
            [Op.notIn]: voterIdsInBuffer,
          },
        },
      });
      // Step 5: Calculate final results
      const finalResult = [];

      // Group commitments by position
      const commitmentsByPosition = {};
      for (const commitment of commitments) {
        const position = commitment.position;
        console.log("finding commitment");
        console.log("position = ", commitment.position);
        if (!commitmentsByPosition[position]) {
          commitmentsByPosition[position] = [];
        }
        commitmentsByPosition[position].push(commitment);

        // console.log(
        //   "commitmentsByPosition = ",
        //   commitmentsByPosition[position]
        // );
      }

      // Calculate result vector for each position
      console.log("summedRandomVectors = ", summedRandomVectors);

      for (const [position, summedVector] of Object.entries(
        summedRandomVectors
      )) {
        console.log(
          `Processing position: ${position}, summedVector:`,
          summedVector
        );

        // Skip if no commitments exist for this position
        if (!commitmentsByPosition[position]) continue;

        // Ensure summedCommitment has the same length as summedVector
        let summedCommitment = Array(summedVector.length).fill(0);

        for (const commitment of commitmentsByPosition[position]) {
          if (
            !votersInBuffer.some((voter) => voter.voter === commitment.voter)
          ) {
            const commitmentArray = commitment.commitment
              .split(",")
              .map((val) => parseInt(val, 10));

            console.log("commitmentArray = ", commitmentArray);

            // Ensure summedCommitment is updated correctly
            summedCommitment = summedCommitment.map(
              (sum, index) => sum + (commitmentArray[index] || 0)
            );
          }
        }

        // Compute the final result vector: result = randomVectorSum - commitmentSum
        const resultVector = summedCommitment.map(
          (val, index) => val - (summedVector[index] || 0)
        );

        // Add to final result array
        finalResult.push({
          position,
          result_vector: resultVector.join(","),
        });
      }

      console.log("Final Results:", finalResult);
      console.log("Voters in Buffer:", votersInBuffer);

      server.close(() => {
        console.log("Result route closed.");
      });
    }, 1000);
  } catch (error) {
    console.error("Error during server initialization:", error);
    process.exit(1);
  }
})();
