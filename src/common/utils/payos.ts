import crypto from 'crypto'

export function verifyPayOSWebhookSignature(body: any, checksumKey: string) {
  const signature = body.signature
  const data = body.data

  // B1: Sắp xếp key trong data theo alphabet
  const sortedKeys = Object.keys(data).sort()

  // B2: Ghép thành chuỗi key=value&key=value
  const raw = sortedKeys.map((k) => `${k}=${data[k]}`).join('&')

  // B3: Tạo HMAC SHA256
  const expectedSignature = crypto.createHmac('sha256', checksumKey).update(raw).digest('hex')

  console.log('stringToSign:', raw)
  console.log('Expected:', expectedSignature)
  console.log('Received:', signature)

  return signature === expectedSignature
}
