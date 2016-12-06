Skyderby.helpers.load_styles = (styles_path) ->
  style_ref = document.createElement('link')
  style_ref.setAttribute('rel', 'stylesheet')
  style_ref.setAttribute('type', 'text/css')
  style_ref.setAttribute('href', styles_path)
  document.getElementsByTagName("head")[0].appendChild(style_ref)
