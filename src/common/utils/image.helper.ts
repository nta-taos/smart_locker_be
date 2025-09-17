import sharp from 'sharp'

export async function resizeAvatarBuffer(buffer: Buffer, outputPath: string, size: number = 256) {
  await sharp(buffer).resize(size, size).jpeg({ quality: 80 }).toFile(outputPath)
}
