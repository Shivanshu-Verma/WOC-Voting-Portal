import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { decryptMiddleware } from "./middlewares/decryption.middleware.js";
import { Commitment } from "./models/Commitments.js";
import { sequelize } from "./db/db.js";
import { Op } from "sequelize";

const app = express();
app.use(bodyParser.json());

const receivedVectors = {}; // Store vectors in memory
const evmIdsSubmitted = {}; // Store EVM IDs and their submission time
let timerStarted = false;
let shutdownTimer = null;

app.post("/api/result/send-vectors", decryptMiddleware, async (req, res) => {
  const { evmId, vectors } = req.body; // req.decryptedData

  if (!evmId || !Array.isArray(vectors)) {
    return res.status(400).json({ error: "Invalid input format" });
  }

  // Validate each vector entry
  for (let vectorObj of vectors) {
    const { position, vector } = vectorObj;
    if (!position || typeof vector !== "string") {
      return res.status(400).json({ error: "Invalid vector entry" });
    }
  }

  try {
    // Store the EVM ID and the current time to track when it last submitted vectors
    evmIdsSubmitted[evmId] = new Date();

    // Process the vectors and store them by position
    vectors.forEach(({ position, vector }) => {
      if (!receivedVectors[position]) {
        receivedVectors[position] = [];
      }
      receivedVectors[position].push(vector.split(",").map(Number)); // Store vector as an array of numbers
    });

    if (!timerStarted) {
      timerStarted = true;
      shutdownTimer = setTimeout(processResults, 60 * 1000); // dies in one minute
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function processResults() {
  console.log("Processing results...");
  console.log("recievedVecs = ", receivedVectors);
  console.log("evmIdsSub = ", evmIdsSubmitted);

  if (Object.keys(receivedVectors).length === 0) {
    console.log("No vectors received. Shutting down.");
    process.exit(0);
  }

  const finalResults = {}; // Store final results per position

  const oneMinuteAgo = new Date(new Date() - 1 * 60 * 1000); // Get the timestamp for 1 minute ago

  // Remove EVMs that haven't sent data in the last 1 minute
  Object.keys(evmIdsSubmitted).forEach((evmId) => {
    if (evmIdsSubmitted[evmId] < oneMinuteAgo) {
      delete evmIdsSubmitted[evmId];
    }
  });

  //   console.log("evmIdsSub2 = ", evmIdsSubmitted);

  // Iterate through each position's vectors
  for (const [position, vectors] of Object.entries(receivedVectors)) {
    // console.log("in loop");
    if (vectors.length === 0) continue;

    // Retrieve commitment entries for the current position that belong to EVMs who submitted vectors within the last 1 minute
    const commitmentEntries = await Commitment.findAll({
      where: {
        position: position,
        evm: { [Op.in]: Object.keys(evmIdsSubmitted) }, // Filter by EVM IDs that submitted vectors
      },
    });

    // console.log("commitmentEnt = ", commitmentEntries);

    // Initialize result vector for this position with commitment data
    let resultVector = new Array(commitmentEntries[0]?.commitment.split(",").length).fill(0);

    // Process each commitment for the current position
    commitmentEntries.forEach((commitment) => {
      // console.log("commitment = ", commitment);
      const commitmentVector = commitment.commitment
        .split(",")
        .map((value) => parseInt(value.trim(), 10));

      // console.log("commitmentVec = ", commitmentVector);

      //   if (resultVector.length === 0) {
      //     console.log("was empty");
      //     resultVector = commitmentVector.slice(); // Copy the first commitment vector
      //   }

      // console.log("res vec = ", resultVector);

      // add the vector for each commitment
      for (let i = 0; i < commitmentVector.length; i++) {
        // console.log("i = ", i);
        resultVector[i] += commitmentVector[i];
        // console.log("res vec for this i = ", resultVector);
      }
    });

    // console.log("init result vec = ", resultVector);

    // Process the vectors received for this position
    vectors.forEach((vector) => {
      for (let i = 0; i < vector.length; i++) {
        resultVector[i] -= vector[i]; // Subtract incoming vector
      }
    });

    finalResults[position] = resultVector;
  }

  // Log the final results per position
  console.log("Final results per position:", finalResults);

  // If you want to save these results, send them to the database, or notify another system, you can do it here.

  process.exit(0); // Exit after processing
}

sequelize.sync().then(() => {
  // await connectDB();
  app.listen(3000, () => console.log("Server running on port 3000"));
});

/**
 * 
 */