import { access } from 'fs/promises'
import { fileExists } from '../fileExists'

jest.mock('fs/promises', () => ({
  access: jest.fn(),
}))

it('returns true when file exists', async () => {
  ;(access as jest.Mock).mockResolvedValue(undefined)

  const result = await fileExists('/path/to/existing/file.txt')

  expect(result).toBe(true)
  expect(access).toHaveBeenCalledWith('/path/to/existing/file.txt')
})

it('returns false when file does not exist', async () => {
  ;(access as jest.Mock).mockRejectedValue(
    new Error('ENOENT: no such file or directory'),
  )

  const result = await fileExists('/path/to/nonexistent/file.txt')

  expect(result).toBe(false)
  expect(access).toHaveBeenCalledWith('/path/to/nonexistent/file.txt')
})

it('returns false when access throws any error', async () => {
  ;(access as jest.Mock).mockRejectedValue(new Error('Permission denied'))

  const result = await fileExists('/path/to/file.txt')

  expect(result).toBe(false)
  expect(access).toHaveBeenCalledWith('/path/to/file.txt')
})
