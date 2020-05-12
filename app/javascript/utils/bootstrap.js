$.fn.modal.Constructor.prototype.enforceFocus = function () {}

document.addEventListener('turbolinks:load', () => {
  $('body').tooltip({
    selector: 'a[rel~=tooltip], .has-tooltip, [data-toggle=tooltip]'
  })
})

document.addEventListener('turbolinks:before-cache', () => {
  $('a[rel~=tooltip], .has-tooltip, [data-toggle=tooltip]').tooltip('destroy')
  $('#modal').modal('hide')
})
