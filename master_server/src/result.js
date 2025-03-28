import express from "express";
import { EVM } from "./models/EVM.js";
import { Commitment } from "./models/Commitment.js";
import { authenticateUser, verifierIsStaff } from "./middlewares/auth.middleware.js";
import { decryptMiddleware } from "./middlewares/decryption.middleware.js";

const app = express();
app.use(express.json());

const processedEVMs = new Set(); // Track processed EVMs

// Open the route for 1 minute
app.post("/send-vecs", authenticateUser, verifierIsStaff, decryptMiddleware, async (req, res) => {
  const evmId = req.evm.id;
  const { randomVector } = req.body; // req.decryptedData

  // Validate randomVector schema
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

  // Check if EVM has already responded
  if (processedEVMs.has(evmId)) {
    return res.status(200).json({ message: "EVM already processed." });
  }

  const evm = await EVM.findByPk(evmId);
  if (!evm) {
    return res.status(404).json({ error: "EVM not found." });
  }

  // Process buffer for outdated entries
  const currentTimestamp = new Date();
  evm.buffer = evm.buffer.filter(
    (entry) => new Date(entry.votedAt) >= currentTimestamp
  );

  // Assign new random vector
  evm.randomVector = randomVector;
  await evm.save();

  processedEVMs.add(evmId); // Mark EVM as processed
  res.status(200).json({ message: "Checkpoint successful." });
});

// Start server temporarily
const server = app.listen(3000, () => {
  console.log("Result route open on port 3000.");
});

setTimeout(async () => {
  console.log("Closing result route...");
  server.close();

  const evms = await EVM.findAll();
  const result = {};
  const summedRandomVectors = {};

  // Sum random vectors for all EVMs
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

  // Process EVM buffers and commitments
  for (const evm of evms) {
    result[evm.id] = { processedCommitments: [] };

    // Check for remaining data points in buffer
    const remainingBuffer = evm.buffer;
    for (const { voter, votedAt } of remainingBuffer) {
      const commitment = await Commitment.findOne({
        where: { evm: evm.id, voter },
      });

      if (commitment) {
        await commitment.destroy(); // Delete the commitment
        result[evm.id].processedCommitments.push({ voter, votedAt });
      }
    }

    // Adjust commitments for each position
    const commitments = await Commitment.findAll({ where: { evm: evm.id } });
    for (const commitment of commitments) {
      const position = commitment.position;
      const summedVector = summedRandomVectors[position];
      if (!summedVector) continue;

      const commitmentArray = commitment.commitment
        .split(",")
        .map((val) => parseInt(val, 10));
      const adjustedCommitment = commitmentArray.map(
        (val, index) => val - (summedVector[index] || 0)
      );

      commitment.commitment = adjustedCommitment.join(",");
      await commitment.save();
    }
  }

  console.log("Final result object:", result);
  console.log("Summed Random Vectors:", summedRandomVectors);
  process.exit(); // End the script
}, 60000); // Run for 1 minute
