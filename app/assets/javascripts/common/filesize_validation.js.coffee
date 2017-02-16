$.validator.addMethod 'filesize', (value, element, param) ->
  # param = size (en bytes)
  # element = element to validate (<input>)
  # value = value of the element (file name)
  @optional(element) || (element.files[0].size <= param)
