import EVM from "../models/EVM.js";
import { EC_Staff } from "../models/EC_Staff.js";
import { encryptData, decryptData } from "../utils/crypto.utils.js";
import { v4 as uuidv4 } from "uuid";
import { formatResponse } from "../utils/formatApiResponse.js";
import crypto from "crypto"

/**
 * Checks if the given port is open on the provided IP.
 */

/**
 * Registers an EVM
 * Steps:
 * 1. Extract IP from request.
 * 2. Ping the given port to check if it's active.
 * 3. Verify biometric data of EC_Staff.
 * 4. Generate EVM ID.
 * 5. Save EVM record.
 */
export const handleEvmRegistration = async (req, res) => {
  const { room, clientPublicKey } = req.body;
  const ip = req.ip; // Extract IP from request

  console.log(req.body);

  if (!room) {
    return res
      .status(400)
      .json(formatResponse(false, null, 400, "Missing required fields."));
  }

  try {
    const prime =
      "eb984f6801b55ce41ccfc793ce2cf98122486e47afd51b31ffdbe26b816b0d5d851acdfcf5d84c786cbf41c6ea77d8e3f26beaeeb6147509a19fe4ce9e2f241448a3f05c08679b50fa7a4bce264757a506e5140fdb9be043f912f0c5c8f1419daf5f6307c83baa7d2c949be489cb1de4fa9f6c37bac1d4b4ce22f08704d40840c74f2fad51f9b5bc127259dc192f047bcc3d9bacbc01ec7916f842c1181e5b5c4c5375d057cb6912fbb51c454a0586d5a5af4777ef2c9e30867c0a40ab40e72b93a7856a5e58eaf377d4b731571b3e57baebab1db14ddb743e6496c2386647839c8702bbad5ec0c52c7d809ccd1a7289380e6489817fb1fa8fa557a8ae1c8ad7";
    const generator = "02";

    const primeBuffer = Buffer.from(prime, "hex");
    const generatorBuffer = Buffer.from(generator, "hex");
    const server = crypto.createDiffieHellman(primeBuffer, generatorBuffer);
    const serverPublicKey = server.generateKeys();
    const sharedSecret = server.computeSecret(
      Buffer.from(clientPublicKey, "hex")
    );

    // Generate EVM ID
    const evmId = uuidv4(); // [No uniqueness check yet]

    const evmKey = crypto
      .createHash("sha256")
      .update(evmId + process.env.MASTER_SECRET_KEY)
      .digest("hex");

    // **Use SHA-256 hash of the shared secret as the AES key**
    const aesKey = crypto.createHash("sha256").update(sharedSecret).digest();

    const iv = Buffer.from(process.env.ENCRYPTION_IV, "hex"); // Initialization Vector (IV)
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);

    let encryptedEvmKey = cipher.update(evmKey, "utf8", "hex");
    encryptedEvmKey += cipher.final("hex");

    // Store in database
    const evm = await EVM.create({
      id: evmId,
      room,
      ip,
      health: 100, // Default health status
      verifiedByStaff: req.verifier.id,
    });

    console.log("evm created = ", evm);

    console.log("Server Public Key  = ",  serverPublicKey.toString("hex"));

    return res.status(201).json(
      formatResponse(
        true,
        {
          evmId,
          serverPublicKey: serverPublicKey.toString("hex"),
          encryptedEvmKey,
          message: "EVM registered successfully",
        },
        null,
        null
      )
    );
  } catch (err) {
    console.error("Error registering EVM:", err);
    return res
      .status(500)
      .json(formatResponse(false, null, 500, "Internal Server Error"));
  }
};
