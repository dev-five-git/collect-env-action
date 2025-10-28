import { writeFile } from 'node:fs/promises'
import { debug, getBooleanInput, getInput, setFailed } from '@actions/core'

export async function run() {
  const prefix = getInput('prefix')
  const output = getInput('output')
  const secrets = JSON.parse(getInput('secrets'))
  const removePrefix = getBooleanInput('remove-prefix')
  debug(`prefix: ${prefix}`)
  debug(`output: ${output}`)
  debug(`secrets: ${secrets}`)
  debug(`removePrefix: ${removePrefix}`)
  debug(`process.env: ${JSON.stringify(process.env)}`)
  debug(`secrets: ${JSON.stringify(secrets)}`)

  const result = Object.entries({ ...secrets, ...process.env })
    .filter(([key]) => key.startsWith(prefix))
    .map(
      ([key, value]) =>
        `${removePrefix ? key.substring(prefix.length) : key}=${value}`,
    )
  result.sort()

  try {
    await writeFile(output, result.join('\n'))
  } catch (err: unknown) {
    setFailed(err as Error)
  }
}
