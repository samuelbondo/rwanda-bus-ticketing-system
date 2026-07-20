import { Request, Response } from 'express'
import { uploadImage } from '../utils/cloudinary.js'

// POST /api/upload
// Body: multipart/form-data — field "file", query "folder" (buses|avatars)
export async function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ message: 'No file provided' })
    return
  }

  const folder = (req.query.folder as string) || 'general'
  const allowed = ['buses', 'avatars', 'general']
  if (!allowed.includes(folder)) {
    res.status(400).json({ message: 'Invalid folder' })
    return
  }

  const result = await uploadImage(req.file.buffer, folder)
  res.json({ data: { url: result.url, publicId: result.publicId } })
}
