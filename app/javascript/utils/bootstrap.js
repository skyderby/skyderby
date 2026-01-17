$.fn.modal.Constructor.prototype.enforceFocus = function () {}

document.addEventListener('turbo:before-cache', () => {
  $('#modal').modal('hide')
})
