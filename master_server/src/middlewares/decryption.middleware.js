import EVM from "../models/EVM.js";
import { decryptFromEVM } from "../utils/crypto.utils.js";

export const decryptMiddleware = async (req, res, next) => {
  try {
    // Get evmID from headers
    const evmId = req.headers['x-evm-id'];

    if (!evmId) {
      return res.status(400).json({ message: "Missing evmId in headers" });
    }

    console.log("evmId = ", evmId)
    const evm = await EVM.findOne({
      where: {
        id: evmId,
      }
    })

    console.log("herer...")

    if (!evm) {
      console.log("EVM not found");
      return res.status(404).json({ message: "EVM not found" });
    }

    console.log("evm = ", evm);

    req.evm = evm;
    // Assume req.body is an encrypted JSON string.
    // const decryptedData = decryptFromEVM(req.body.data, evmId);
    // console.log("decryptedData = ", decryptedData);
    // req.decryptedData = decryptedData;
    // Meaningless MITM catching
    // request to EVM health module
    next();
  } catch (error) {
    console.error("Error decrypting data: ", error);
    return res.status(400).json({ message: "Failed to decrypt request data" });
  }
};
