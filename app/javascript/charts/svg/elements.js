export const SVG_NS = 'http://www.w3.org/2000/svg'

export const svgEl = (tag, attrs = {}, text) => {
  const node = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
  if (text !== undefined) node.textContent = text
  return node
}
