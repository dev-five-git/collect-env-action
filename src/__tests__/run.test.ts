import { expect, mock, test } from 'bun:test'
import { writeFile } from 'node:fs/promises'
import { getBooleanInput, getInput, setFailed } from '@actions/core'

const mockWriteFile = mock(writeFile)
const mockGetInput = mock(getInput)
const mockSetFailed = mock(setFailed)
const mockGetBooleanInput = mock(getBooleanInput)

mock.module('node:fs/promises', () => ({
  writeFile: mockWriteFile,
}))

mock.module('@actions/core', () => ({
  getInput: mockGetInput,
  setFailed: mockSetFailed,
  getBooleanInput: mockGetBooleanInput,
}))

import { run } from '../run'

test('should write filtered environment variables to file', async () => {
  const testPrefix = 'TEST_'
  const testOutput = 'test.env'

  process.env.TEST_VAR1 = 'value1'
  process.env.TEST_VAR2 = 'value2'
  process.env.OTHER_VAR = 'other'

  mockGetInput.mockImplementation((name: string) => {
    switch (name as 'prefix' | 'output' | 'secrets') {
      case 'prefix':
        return testPrefix
      case 'output':
        return testOutput
      case 'secrets':
        return '{"TEST_SECRET": "secret123"}'
    }
  })

  mockWriteFile.mockResolvedValue(undefined)
  mockGetBooleanInput.mockReturnValue(false)

  await run()

  expect(mockGetInput).toHaveBeenCalledWith('prefix')
  expect(mockGetInput).toHaveBeenCalledWith('output')
  expect(mockGetBooleanInput).toHaveBeenCalledWith('remove-prefix')
  expect(mockWriteFile).toHaveBeenCalledWith(
    testOutput,
    'TEST_SECRET=secret123\nTEST_VAR1=value1\nTEST_VAR2=value2',
  )
})

test('should handle writeFile error', async () => {
  const testPrefix = 'TEST_'
  const testOutput = 'test.env'
  const testError = 'Write failed'

  process.env.TEST_VAR = 'value'

  mockGetInput.mockImplementation((name: string) => {
    switch (name as 'prefix' | 'output' | 'secrets') {
      case 'prefix':
        return testPrefix
      case 'output':
        return testOutput
      case 'secrets':
        return '{"TEST_SECRET": "secret123"}'
    }
  })

  mockWriteFile.mockRejectedValue(testError)
  mockGetBooleanInput.mockReturnValue(false)

  await run()

  expect(mockSetFailed).toHaveBeenCalledWith(testError)
  process.exitCode = 0
})

test('should handle empty environment variables', async () => {
  const testPrefix = 'NONEXISTENT_'
  const testOutput = 'empty.env'

  mockGetInput.mockImplementation((name: string) => {
    switch (name as 'prefix' | 'output' | 'secrets') {
      case 'prefix':
        return testPrefix
      case 'output':
        return testOutput
      case 'secrets':
        return '{"TEST_SECRET": "secret123"}'
    }
  })

  mockWriteFile.mockResolvedValue(undefined)
  mockGetBooleanInput.mockReturnValue(false)

  await run()

  expect(mockWriteFile).toHaveBeenCalledWith(testOutput, '')
  expect(mockGetInput).toHaveBeenCalledWith('secrets')
})

test('should filter environment variables by prefix', async () => {
  const testPrefix = 'API_'
  const testOutput = 'api.env'

  process.env.API_KEY = 'secret123'
  process.env.API_URL = 'https://api.example.com'
  process.env.DATABASE_URL = 'postgres://localhost'
  process.env.API_TIMEOUT = '5000'

  mockGetInput.mockImplementation((name: string) => {
    switch (name as 'prefix' | 'output' | 'secrets') {
      case 'prefix':
        return testPrefix
      case 'output':
        return testOutput
      case 'secrets':
        return '{"TEST_SECRET": "secret123"}'
    }
  })

  mockWriteFile.mockResolvedValue(undefined)
  mockGetBooleanInput.mockReturnValue(false)
  await run()

  const expectedContent = [
    'API_KEY=secret123',
    'API_TIMEOUT=5000',
    'API_URL=https://api.example.com',
  ].join('\n')

  expect(mockWriteFile).toHaveBeenCalledWith(testOutput, expectedContent)
})

test('should remove prefix from environment variables', async () => {
  const testPrefix = 'API_'
  const testOutput = 'api.env'
  const testRemovePrefix = true
  process.env.API_KEY = 'secret123'
  process.env.API_URL = 'https://api.example.com'
  process.env.API_TIMEOUT = '5000'

  mockGetInput.mockImplementation((name: string) => {
    switch (name as 'prefix' | 'output' | 'secrets') {
      case 'prefix':
        return testPrefix
      case 'output':
        return testOutput
      case 'secrets':
        return '{"TEST_SECRET": "secret123"}'
    }
  })

  mockWriteFile.mockResolvedValue(undefined)
  mockGetBooleanInput.mockReturnValue(testRemovePrefix)

  await run()

  const expectedContent = [
    'KEY=secret123',
    'TIMEOUT=5000',
    'URL=https://api.example.com',
  ].join('\n')

  expect(mockWriteFile).toHaveBeenCalledWith(testOutput, expectedContent)
})
