import { Request, Response, NextFunction } from 'express'
import { uploadImage } from '../utils/cloudinary.js'
import { env } from '../config/env.js'

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      res.status(503).json({ message: 'Image upload is not configured on this server' })
      return
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file provided' })
      return
    }

    const folder = (req.query.folder as string) || 'general'
    const allowed = ['buses', 'avatars', 'general', 'slideshow', 'payment-proofs']
    if (!allowed.includes(folder)) {
      res.status(400).json({ message: 'Invalid folder' })
      return
    }

    const result = await uploadImage(req.file.buffer, folder)
    res.json({ url: result.url, publicId: result.publicId })
  } catch (err) {
    next(err)
  }
}
