$(document).on 'ajax:error', '[data-remote=true]', (_event, xhr) ->
  return if xhr.status == 422
  AjaxErrorMessage.render()
