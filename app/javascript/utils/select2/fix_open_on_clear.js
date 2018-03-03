import 'select2'

export function fix_open_on_clear($el) {
  $el.select2().on("select2:unselecting", on_unselecting)
               .on('select2:open', on_open)
}

function on_unselecting() {
  $(this).data('unselecting', true)
}

function on_open() {
    if ($(this).data('unselecting')) {
      $(this).select2('close')
      $(this).data('unselecting', false)
    }
}
