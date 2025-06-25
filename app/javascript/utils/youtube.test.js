import { test, describe, expect } from 'vitest'
import { videoCodeFromUrl } from './youtube'

describe('videoCodeFromUrl', () => {
  test('extracts video code from standard YouTube URL', () => {
    expect(videoCodeFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    )
  })

  test('extracts video code from YouTube URL with additional parameters', () => {
    expect(videoCodeFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')).toBe(
      'dQw4w9WgXcQ'
    )
  })

  test('extracts video code from shortened youtu.be URL', () => {
    expect(videoCodeFromUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  test('extracts video code from youtu.be URL with parameters', () => {
    expect(videoCodeFromUrl('https://youtu.be/dQw4w9WgXcQ?t=42')).toBe('dQw4w9WgXcQ')
  })

  test('extracts video code from embed URL', () => {
    expect(videoCodeFromUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    )
  })

  test('extracts video code from /v/ URL format', () => {
    expect(videoCodeFromUrl('https://www.youtube.com/v/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  test('returns undefined for invalid URL', () => {
    expect(videoCodeFromUrl('https://example.com/video')).toBeUndefined()
  })

  test('returns undefined for empty string', () => {
    expect(videoCodeFromUrl('')).toBeUndefined()
  })

  test('returns undefined for non-YouTube URL', () => {
    expect(videoCodeFromUrl('https://vimeo.com/123456789')).toBeUndefined()
  })

  test('handles URL with www and without www', () => {
    expect(videoCodeFromUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    )
  })

  test('handles mobile YouTube URL', () => {
    expect(videoCodeFromUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    )
  })

  test('extracts video code with underscore and hyphen', () => {
    expect(videoCodeFromUrl('https://www.youtube.com/watch?v=abc_123-xyz')).toBe(
      'abc_123-xyz'
    )
  })

  test('extracts video code from real example URL', () => {
    expect(videoCodeFromUrl('https://www.youtube.com/watch?v=GAsVaWWAArA')).toBe(
      'GAsVaWWAArA'
    )
  })

  test('returns same video code for duplicate URLs', () => {
    const url = 'https://www.youtube.com/watch?v=GAsVaWWAArA'
    expect(videoCodeFromUrl(url)).toBe('GAsVaWWAArA')
    expect(videoCodeFromUrl(url)).toBe('GAsVaWWAArA')
  })

  test('extracts video code from youtu.be URL with si parameter', () => {
    expect(videoCodeFromUrl('https://youtu.be/GAsVaWWAArA?si=yGqEbVdDBWwYapvZ')).toBe(
      'GAsVaWWAArA'
    )
  })

  test('extracts video code from YouTube Shorts URL', () => {
    expect(
      videoCodeFromUrl('https://youtube.com/shorts/OAb9gaGq_rM?si=lt74jbJY7cpaamX8')
    ).toBe('OAb9gaGq_rM')
  })
})
