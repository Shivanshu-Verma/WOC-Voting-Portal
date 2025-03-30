import "dotenv/config";
import express from "express";
import { connectDB, sequelize } from "../db/db.js";
import { EVM } from "../models/EVM.js";
import { Commitment } from "../models/Commitments.js";
import { authenticateUser, verifierIsStaff } from "../middlewares/auth.middleware.js";
import { decryptMiddleware } from "../middlewares/decryption.middleware.js";

(async () => {
  try {
    // Connect to PostgreSQL and sync models
    console.log("lund = ", process.env.PORT)

    await connectDB();
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully!");

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
              !entry.randomVector.split(",").every((val) => !isNaN(parseInt(val, 10)))
          )
        ) {
          return res.status(400).json({ error: "Invalid randomVector format." });
        }

        if (processedEVMs.has(evmId)) {
          return res.status(200).json({ message: "EVM already processed." });
        }

        const evm = await EVM.findByPk(evmId);
        if (!evm) {
          return res.status(404).json({ error: "EVM not found." });
        }

        evm.buffer = evm.buffer.filter(
          (entry) => new Date(entry.votedAt) >= new Date()
        );
        evm.randomVector = randomVector;
        await evm.save();

        processedEVMs.add(evmId);
        res.status(200).json({ message: "Checkpoint successful." });
      }
    );

    const server = app.listen(6969, () => {
      console.log("Result route open on port",  6969);
    });

  setTimeout(async () => {
    console.log("Closing result route...");
    server.close();

    const evms = await EVM.findAll();
    const result = {};
    const summedRandomVectors = {};

    // Step 1: Sum up random vectors for each position
    for (const evm of evms) {
      evm.randomVector.forEach(({ position, randomVector }) => {
        const vectorArray = randomVector.split(",").map((val) => parseInt(val, 10));
        if (!summedRandomVectors[position]) {
          summedRandomVectors[position] = Array(vectorArray.length).fill(0);
        }
        summedRandomVectors[position] = summedRandomVectors[position].map(
          (sum, index) => sum + (vectorArray[index] || 0)
        );
      });
    }

    // Step 2: Process commitments and format the result
    for (const evm of evms) {
      result[evm.id] = { processedCommitments: [], positions: {} };

      // Process commitments
      for (const { voter, votedAt } of evm.buffer) {
        const commitment = await Commitment.findOne({ where: { evm: evm.id, voter } });
        if (commitment) {
          await commitment.destroy();
          result[evm.id].processedCommitments.push({ voter, votedAt });
        }
      }

      // Adjust commitments based on summed vectors
      const commitments = await Commitment.findAll({ where: { evm: evm.id } });
      for (const commitment of commitments) {
        const position = commitment.position;
        const summedVector = summedRandomVectors[position];
        if (!summedVector) continue;

        const commitmentArray = commitment.commitment.split(",").map((val) => parseInt(val, 10));
        const resultVector = commitmentArray.map((val, index) => val - (summedVector[index] || 0));

        // Store result in the structured format
        result[evm.id].positions[position] = {
          result_vector: resultVector.join(","),
        };

        commitment.commitment = resultVector.join(",");
        await commitment.save();
    }
  }

  console.log("Final result object:", result);
  console.log("Summed Random Vectors:", summedRandomVectors);
  process.exit();
}, 10000);

  } catch (error) {
    console.error("Error during server initialization:", error);
  }
})();
