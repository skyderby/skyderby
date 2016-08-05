class Skyderby.views.Event extends Backbone.View
  events: 
    'ajax:error [data-remote=true]' : 'on_ajax_error'

  on_ajax_error: (xhr, status, error) ->
    AjaxErrorMessage.display()
