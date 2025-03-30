// AES-256-CBC decryption using SHA-256 of the shared secret
const decryptAES256CBC = async (encryptedData, sharedKey) => {
  try {
    // Convert hex strings to ArrayBuffer
    const sharedKeyBuffer = hexToBuffer(sharedKey);
    const ivBuffer = hexToBuffer(encryption_iv);
    const encryptedBuffer = hexToBuffer(encryptedData);

    // Hash the shared secret with SHA-256 to derive the encryption key
    const hashedKey = await window.crypto.subtle.digest(
      'SHA-256',
      sharedKeyBuffer
    );

    // Import the hashed key for AES decryption
    const key = await window.crypto.subtle.importKey(
      'raw',
      hashedKey,
      { name: 'AES-CBC', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt the data using AES-CBC
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivBuffer },
      key,
      encryptedBuffer
    );

    // Convert the decrypted data to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt: " + error.message);
  }
};