class ForbiddenError extends Error {
  constructor(message) {
    super(message || 'Forbidden error')

    this.name = 'ForbiddenError'
  }
}

export default ForbiddenError
