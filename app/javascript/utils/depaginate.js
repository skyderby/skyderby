const depaginate = async (resourse, { perPage = 100 } = {}) => {
  const firstChunk = await resourse.findAll({ perPage })

  const restPages = new Array(firstChunk.totalPages - 1).fill().map((_el, idx) => idx + 2)

  const restChunks = await Promise.all(
    restPages.map(page => resourse.findAll({ page, perPage }))
  )

  const allChunks = [firstChunk, ...restChunks]

  return allChunks
}

export default depaginate
