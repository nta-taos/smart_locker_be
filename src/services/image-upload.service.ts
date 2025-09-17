import autoBind from 'auto-bind'
import fs from 'fs'
import { injectable } from 'inversify'
import multer from 'multer'
import path from 'path'

import { ErrorMessages } from '@/common/constants/messages'
import { ApiError } from '@/common/responses'
import { resizeAvatarBuffer } from '@/common/utils/image.helper'

@injectable()
export class ImageUploadService {
  private uploadDir = path.join(__dirname, '../../uploads')
  private storage: multer.StorageEngine
  public upload: multer.Multer

  constructor() {
    autoBind(this)

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }

    this.storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, this.uploadDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
        cb(null, filename)
      }
    })

    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(ApiError.badRequest(ErrorMessages.IMAGE_INVALID))
        }
        cb(null, true)
      }
    })
  }
  async saveFile(file: Express.Multer.File) {
    if (!file) throw ApiError.badRequest(ErrorMessages.IMAGE_REQUIRED)

    const ext = path.extname(file.originalname)
    const avatarFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-avatar${ext}`
    const avatarPath = path.join(this.uploadDir, avatarFilename)

    console.log(avatarPath)

    await resizeAvatarBuffer(file.buffer, avatarPath, 256)

    return {
      filename: avatarFilename,
      avatarPath: `/uploads/${avatarFilename}`
    }
  }
}
