export const SVG_NS = 'http://www.w3.org/2000/svg'

const PAINT_ATTRS = new Set(['fill', 'stroke', 'stop-color'])

export const svgEl = (tag, attrs = {}, text) => {
  const node = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (PAINT_ATTRS.has(key) && String(value).includes('var(')) {
      node.style.setProperty(key, value)
    } else {
      node.setAttribute(key, value)
    }
  }
  if (text !== undefined) node.textContent = text
  return node
}
