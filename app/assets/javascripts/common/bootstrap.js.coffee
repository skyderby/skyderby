# Bootstrap registers a listener to the focusin event which checks whether
# the focused element is either the overlay itself or a descendent of it -
# if not it just refocuses on the overlay. With the select2 dropdown being
# attached to the body this effectively prevents you from entering anything
# into the the textfield.
$.fn.modal.Constructor.prototype.enforceFocus = () ->

$(document).on 'turbolinks:load', ->
  # Enable tooltips
  $('body').tooltip({selector: "a[rel~=tooltip], .has-tooltip, [data-toggle=tooltip]"})

  # Enable tabs
  $('body').delegate 'click', '[data-toggle=tab] > a', (e) ->
    e.preventDefault()
    $(this).tab('show')
