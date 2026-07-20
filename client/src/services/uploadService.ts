import api from './api'

export const uploadService = {
  async uploadImage(file: File, folder: 'buses' | 'avatars' | 'general'): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post(`/upload?folder=${folder}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data.url as string
  },
}
