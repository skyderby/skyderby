const useRoot = (elementId: string): HTMLElement => {
  const existentNode = document.getElementById(elementId)
  if (existentNode) return existentNode

  const newNode = document.createElement('div')
  newNode.setAttribute('id', elementId)
  document.body.insertAdjacentElement('beforeend', newNode)

  return newNode
}

export default useRoot
