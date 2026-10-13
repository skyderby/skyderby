export const debounce = (fn, wait) => {
  let timer = null

  const debounced = function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, wait)
  }
  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
  }

  return debounced
}

export const throttle = (fn, wait) => {
  let lastCall = 0
  let timer = null
  let pendingArgs = null
  let pendingThis = null

  const invoke = () => {
    lastCall = Date.now()
    timer = null
    const args = pendingArgs
    const context = pendingThis
    pendingArgs = null
    pendingThis = null
    fn.apply(context, args)
  }

  const throttled = function (...args) {
    pendingArgs = args
    pendingThis = this
    const remaining = wait - (Date.now() - lastCall)

    if (remaining <= 0) {
      clearTimeout(timer)
      invoke()
    } else if (!timer) {
      timer = setTimeout(invoke, remaining)
    }
  }
  throttled.cancel = () => {
    clearTimeout(timer)
    timer = null
    lastCall = 0
    pendingArgs = null
    pendingThis = null
  }

  return throttled
}
