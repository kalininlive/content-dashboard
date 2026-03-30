import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto"

function getKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set")
  // Derive a 32-byte key from the secret using SHA-256
  return createHash("sha256").update(secret).digest()
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a base64-encoded string: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12) // 96-bit IV for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":")
}

/**
 * Decrypts a string produced by encrypt().
 */
export function decrypt(encoded: string): string {
  const key = getKey()
  const [ivB64, authTagB64, encryptedB64] = encoded.split(":")
  if (!ivB64 || !authTagB64 || !encryptedB64) {
    throw new Error("Invalid encrypted format")
  }

  const iv = Buffer.from(ivB64, "base64")
  const authTag = Buffer.from(authTagB64, "base64")
  const encrypted = Buffer.from(encryptedB64, "base64")

  const decipher = createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
}
