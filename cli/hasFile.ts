import { readFile } from "fs/promises";

export async function hasFile(path: string) {
  return readFile(path).then(() => true, () => false)
}