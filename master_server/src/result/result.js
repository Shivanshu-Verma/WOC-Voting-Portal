import "dotenv/config";
import express from "express";
import { connectDB, sequelize } from "../db/db.js";
import { EVM } from "../models/EVM.js";
import { Commitment } from "../models/Commitments.js";
import { Candidate } from "../models/Candidate.js";
import {
  authenticateUser,
  verifierIsStaff,
} from "../middlewares/auth.middleware.js";
import { decryptMiddleware } from "../middlewares/decryption.middleware.js";
import { Op } from "sequelize";

import { fileURLToPath } from "url";
import { dirname } from "path";

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let resultsCalculated = false;

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
        if (resultsCalculated) {
          return res.status(403).json({
            success: false,
            error: "Checkpointing is closed. Results have been finalized.",
          });
        }

        try {
          console.log("Checkpointing called...");
          const evmId = req.evm.id; // EVM ID
          const { randomVector, clientCurrentTS } = req.body;
          const currentTimestamp = new Date();

          console.log("Server TS =", currentTimestamp);
          console.log("Client TS =", new Date(clientCurrentTS));

          if (new Date(clientCurrentTS) > currentTimestamp) {
            return res.status(400).json({
              success: false,
              error: "Client timestamp cannot be in the future.",
            });
          }

          console.log("req.body =", req.body);

          // Validate `randomVector` format
          if (
            !Array.isArray(randomVector) ||
            randomVector.some(
              (entry) =>
                typeof entry !== "object" ||
                !entry.position ||
                !entry.randomVector
            )
          ) {
            return res.status(400).json({
              success: false,
              error:
                "Invalid randomVector format. Each entry must have 'position' and 'randomVector'.",
            });
          }

          // Fetch EVM
          const evm = await EVM.findByPk(evmId);
          if (!evm) {
            return res
              .status(404)
              .json({ success: false, error: "EVM not found." });
          }

          // Filter buffer entries that are newer than client timestamp
          const updatedBuffer = evm.buffer.filter(
            (entry) => new Date(entry.votedAt) >= new Date(clientCurrentTS)
          );

          // Convert existing randomVector to a map for easy merging
          const existingRandomVectorMap = new Map(
            evm.randomVector.map((entry) => [
              entry.position,
              JSON.parse(entry.randomVector),
            ])
          );

          // Merge the incoming randomVector with existing values
          randomVector.forEach((entry) => {
            const existingValues =
              existingRandomVectorMap.get(entry.position) || [];
            const newValues = Array.isArray(entry.randomVector)
              ? entry.randomVector
              : [entry.randomVector];

            // Append new values while ensuring they are arrays
            existingRandomVectorMap.set(entry.position, [
              ...existingValues,
              ...newValues,
            ]);
          });

          // Convert back to the required format
          const updatedRandomVector = Array.from(
            existingRandomVectorMap.entries()
          ).map(([position, vector]) => ({
            position,
            randomVector: JSON.stringify(vector), // Store as string
          }));

          // Update the EVM record in the database
          await EVM.update(
            { buffer: updatedBuffer, randomVector: updatedRandomVector },
            { where: { id: evm.id } }
          );

          console.log("EVM checkpointed successfully.");

          return res.status(200).json({
            success: true,
            message: "Checkpointing successful.",
            randomVector: updatedRandomVector,
          });
        } catch (error) {
          console.error("Error during checkpointing:", error);
          return res
            .status(500)
            .json({ success: false, error: "Internal Server Error" });
        }
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

      // Step 6: Prepare modified candidate results
      const modifiedCandidateResult = [];

      for (const result of finalResult) {
        const { position, result_vector } = result;
        const resultArray = result_vector
          .split(",")
          .map((val) => parseInt(val, 10));

        console.log("resultArray = ", resultArray);

        for (let index = 0; index < resultArray.length; index++) {
          const basis = index + 1;

          // Fetch candidate info from the database
          const candidate = await Candidate.findOne({
            where: {
              position: position,
              basis: String(basis),
            },
          });

          if (candidate) {
            modifiedCandidateResult.push({
              position: position,
              candidateName: candidate.name,
              candidateId: candidate.id,
              votes: resultArray[index],
            });
          }
        }
      }

      console.log("Modified Candidate Result:", modifiedCandidateResult);
      resultsCalculated = true;

      app.get("/results", (req, res) => {
        res.json({ success: true, results: modifiedCandidateResult });
      });

      app.use(express.static("public"));

      app.get("/", (req, res) => {
        res.sendFile(__dirname + "/public/results.html");
      });

      console.log("Results available at http://localhost:6969");
    }, 1000);
  } catch (error) {
    console.error("Error during server initialization:", error);
    process.exit(1);
  }
})();
