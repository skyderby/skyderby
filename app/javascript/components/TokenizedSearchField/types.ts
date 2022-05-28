export const allowedValueKeys = ['profileId', 'placeId', 'suitId', 'year'] as const
export const isAllowedValueKey = (key: string): key is ValueKey => {
  return allowedValueKeys.includes(key as ValueKey)
}

export type Mode = 'idle' | 'selectType' | 'selectValue'
export type ValueKey = typeof allowedValueKeys[number]
export type TokenTuple = readonly [ValueKey, string | number]
