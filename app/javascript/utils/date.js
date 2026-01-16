export const formatMonthYear = date => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}-${year}`
}

export const differenceInMilliseconds = (dateA, dateB) =>
  dateA.getTime() - dateB.getTime()
