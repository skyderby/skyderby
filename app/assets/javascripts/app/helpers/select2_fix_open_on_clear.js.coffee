Skyderby.helpers.select2_fix_open_on_clear = ($el) ->
  $el.select2().on("select2:unselecting", (e) ->
    $(this).data('unselecting', true)
  ).on('select2:open', (e) ->
    if $(this).data('unselecting')
      $(this).select2('close')
      $(this).data('unselecting', false)
  )
