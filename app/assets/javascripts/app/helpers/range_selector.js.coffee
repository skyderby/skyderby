Skyderby.helpers.RangeSelector = ($el, min, max, from, to) ->
  $el.ionRangeSlider({
    min: min,
    max: max,
    type: 'double',
    step: 50,
    prettify: false,
    hasGrid: true,
    from: from,
    to: to,
    onFinish: (obj) ->
      $.rails.fire(obj.input[0], 'change')
  })

  $(document).on 'turbolinks:before-cache', ->
    $el.ionRangeSlider('remove')
