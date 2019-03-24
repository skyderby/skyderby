(function(e) {
  e.closest = e.closest || function(css) {
    let node = this

    while (node) {
      if (node.matches(css)) return node

      node = node.parentElement
    }

    return null
  }
})(Element.prototype)
