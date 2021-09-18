export const showLinkOnDesktop = (
  activePage: number,
  currentPage: number,
  totalPages: number
): boolean => {
  if (activePage < 3) return currentPage > 5
  if (totalPages - activePage < 3) return currentPage < totalPages - 4

  return Math.abs(currentPage - activePage) > 2
}
