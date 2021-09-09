const colors = [
  '#7cb5ec',
  '#90ed7d',
  '#f7a35c',
  '#8085e9',
  '#f15c80',
  '#e4d354',
  '#8085e8',
  '#8d4653',
  '#91e8e1',
  '#434348'
] as const

export const colorByIndex = (idx: number): string => {
  const fallbackColor = colors[0]
  return colors[idx % (colors.length - 1)] ?? fallbackColor
}

export default colors
