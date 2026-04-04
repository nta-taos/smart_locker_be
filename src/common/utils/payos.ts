import crypto from 'crypto'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function verifyPayOSWebhookSignature(body: any, checksumKey: string) {
  const signature = body.signature
  const data = body.data
  const sortedKeys = Object.keys(data).sort()
  const raw = sortedKeys.map((k) => `${k}=${data[k]}`).join('&')
  const expectedSignature = crypto.createHmac('sha256', checksumKey).update(raw).digest('hex')
  return signature === expectedSignature
}
