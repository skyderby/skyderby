export default function <T = unknown>(sourceArray: Array<T>): Array<T> {
  const array = sourceArray.slice()

  let currentIndex = array.length

  while (0 !== currentIndex) {
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    const temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}
