import crypto from 'crypto';

export const encryptBiometric = (data) => {
  // const secret = process.env.ENCRYPTION_SECRET; // Shared secret
  // const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

  // // Hash the secret using SHA-256 to derive the encryption key
  // const key = crypto.createHash('sha256').update(secret).digest();

  // const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  // let encrypted = cipher.update(data, 'utf8', 'hex');
  // encrypted += cipher.final('hex');
  // return encrypted;
  return data;
};


export const encryptData = (data) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decryptData = (encryptedData) => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
  * construct Key : key = H(msk||evmId)
  * decrypt decryptedData = D(key, encryptedData)
  * return decryptedData
 */
export const decryptFromEVM = (encryptedData, evmId) => {
  try {
    // Construct the key: H(msk || evmId)
    const key = crypto.createHash("sha256").update(process.env.MASTER_SECRET_KEY + evmId).digest();
    console.log("key = ", key);
    // Convert the encryptedData from base64 to a buffer
    const encryptedBuffer = Buffer.from(encryptedData, "base64");

    // Extract IV (assuming the first 16 bytes store the IV)
    const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
    const cipherText = encryptedBuffer.slice(16);
    console.log("ct = ", cipherText);
    // Decrypt using AES-256-CBC
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    console.log("pt = ", decipher);
    let decrypted = decipher.update(cipherText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    console.log("decrypted = ", decrypted.toString("utf-8"));

    // console.log("ppp = ", JSON.parse(decrypted.toString("utf-8")));
    // Convert to a readable format (assuming it's JSON)
    return JSON.parse(decrypted.toString("utf-8"));
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Invalid decryption");
  }
};

/**
* construct Key : key = H(msk||evmId)
* decrypt encryptedData = E(key, data)
* return encryptedData
 */
export const encryptForEVM = (data, evmId) => {
  try {
    // Construct the key: H(msk || evmId)
    const key = crypto.createHash("sha256").update(process.env.MASTER_SECRET_KEY + evmId).digest();

    // Generate a random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);

    // Convert data to a string and encrypt
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(JSON.stringify(data), "utf-8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Return the IV and encrypted data as a single base64-encoded string
    return Buffer.concat([iv, encrypted]).toString("base64");
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption error");
  }
};
