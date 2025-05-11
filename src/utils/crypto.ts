import { verify } from 'crypto'

export async function verifyData(
  publicKey: string,
  signature: string,
  data: string
) {
  try {
    const isValid = verify(
      'RSA-SHA256',
      Buffer.from(data),
      Buffer.from(publicKey, 'base64'),
      Buffer.from(signature, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
