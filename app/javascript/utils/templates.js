export const cloneTemplate = template =>
  template.content.firstElementChild.cloneNode(true)

export const slots = (root, name) => {
  const matches = Array.from(root.querySelectorAll(`[data-slot="${name}"]`))
  if (root.dataset?.slot === name) matches.unshift(root)
  return matches
}

export const slot = (root, name) => slots(root, name)[0] ?? null

export const fillSlots = (root, values) => {
  Object.entries(values).forEach(([name, value]) => {
    slots(root, name).forEach(element => {
      element.textContent = value == null ? '' : String(value)
    })
  })
  return root
}
