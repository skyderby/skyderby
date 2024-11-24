$.fn.modal.Constructor.prototype.enforceFocus = function () {}

document.addEventListener('turbo:load', () => {
  $('body').tooltip({
    selector: 'a[rel~=tooltip], .has-tooltip, [data-toggle=tooltip]'
  })
})

document.addEventListener('turbo:before-cache', () => {
  $('a[rel~=tooltip], .has-tooltip, [data-toggle=tooltip]').tooltip('destroy')
  $('#modal').modal('hide')
})
