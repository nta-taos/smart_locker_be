import AWS from 'aws-sdk'
import dotenv from 'dotenv'

dotenv.config()

class S3Client {
  private static instance: AWS.S3

  private constructor() {}

  public static getInstance(): AWS.S3 {
    if (!S3Client.instance) {
      S3Client.instance = new AWS.S3({
        accessKeyId: process.env.ACCESS_KEY_ID as string,
        secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
        endpoint: process.env.S3_ENDPOINT as string, // Ví dụ: "https://s3.filebase.com"
        s3ForcePathStyle: true
      })
    }
    return S3Client.instance
  }
}

export default S3Client
