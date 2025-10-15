import { writeFile } from 'node:fs/promises'
import { debug, getBooleanInput, getInput, setFailed } from '@actions/core'

export async function run() {
  const prefix = getInput('prefix')
  const output = getInput('output')
  const removePrefix = getBooleanInput('remove-prefix')
  debug(`prefix: ${prefix}`)
  debug(`output: ${output}`)
  debug(`removePrefix: ${removePrefix}`)
  debug(`process.env: ${JSON.stringify(Object.keys(process.env), null, 2)}`)
  debug(`process.env: ${JSON.stringify(Object.entries(process.env), null, 2)}`)

  try {
    await writeFile(
      output,
      Object.keys(process.env)
        .filter((key) => key.startsWith(prefix))
        .map(
          (key) =>
            `${removePrefix ? key.substring(prefix.length) : key}=${process.env[key]}`,
        )
        .join('\n'),
    )
  } catch (err: unknown) {
    setFailed(err as Error)
  }
}
