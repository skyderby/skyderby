const EDGE_THRESHOLD = 16

export function orient(el, shouldOrient = true) {
  el.classList.remove('orient-left', 'orient-right')

  if (!shouldOrient) return

  const rightSpace = spaceOnRight(el)
  const leftSpace = spaceOnLeft(el)

  if (rightSpace < EDGE_THRESHOLD && rightSpace < leftSpace) {
    el.classList.add('orient-left')
  } else if (leftSpace < EDGE_THRESHOLD && leftSpace < rightSpace) {
    el.classList.add('orient-right')
  }
}

function spaceOnLeft(el) {
  return el.getBoundingClientRect().left
}

function spaceOnRight(el) {
  return window.innerWidth - el.getBoundingClientRect().right
}
