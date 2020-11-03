const camelize = string =>
  string.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase())

export default camelize
