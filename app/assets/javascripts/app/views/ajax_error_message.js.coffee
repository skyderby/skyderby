class Skyderby.views.AjaxErrorMessage extends Backbone.View
  events:
    'click .ajax-error-dismiss': 'on_close_click'
    'mouseover'                : 'on_mouseover'

  el: '#ajax-error-message'

  text: 'Something went wrong with that request. Please try again.'

  initialize: ->
    $(document).on('keydown', (e) =>
      @hide() if e.which == 27
    )

  render: (text)->
    message_text = @text
    message_text = text if !!text
    @update_text(message_text)
    @show()

  on_close_click: (e) ->
    e.preventDefault()
    @hide()

  on_mouseover: ->
    clearTimeout(@timer)

  update_text: (text) ->
    @$('#ajax-error-message-text').text(text)

  show: ->
    @$el.addClass('visible')
    @timer = setTimeout( =>
      @hide()
    , 5000)

  hide: ->
    @$el.removeClass('visible')
