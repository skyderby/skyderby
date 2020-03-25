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
]

export const colorByIndex = idx => colors[idx % (colors.length - 1)]

export default colors
