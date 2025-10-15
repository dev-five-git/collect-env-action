import { writeFile } from 'node:fs/promises'
import { getBooleanInput, getInput, setFailed } from '@actions/core'

export async function run() {
  const prefix = getInput('prefix')
  const output = getInput('output')
  const removePrefix = getBooleanInput('remove-prefix')

  try {
    await writeFile(
      output,
      Object.entries(process.env)
        .filter(([key]) => key.startsWith(prefix))
        .map(
          ([key, value]) =>
            `${removePrefix ? key.substring(prefix.length) : key}=${value}`,
        )
        .join('\n'),
    )
  } catch (err: unknown) {
    setFailed(err as Error)
  }
}
