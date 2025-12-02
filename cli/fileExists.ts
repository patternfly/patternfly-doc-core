import { access } from 'fs/promises'

export async function fileExists(file: string): Promise<boolean> {
  return access(file)
    .then(() => true)
    .catch(() => false)
}
