class Skyderby.views.AvatarEditView extends Backbone.View

  events:
    'change [name="profile[userpic]"]': 'on_file_change'

  initialize: (opts) ->
    @init_jcrop()
    this

  init_jcrop: ->
    @jcrop && @jcrop.destroy()
    view = this
    @$('.avatar-edit__crop').removeAttr('style')
    @$('.avatar-edit__crop').Jcrop({
      keySupport: false
      aspectRatio: 1
      minSize: [150, 150]
      setSelect: [0, 0, 200, 200]
      onSelect: view.update_coordinates.bind(view)
      onChange: view.update_coordinates.bind(view)
      boxWidth: 390
      boxHeight: 292
    }, ->
      view.jcrop = this
    )

  on_file_change: (e) ->
    input = $(e.currentTarget)[0]
    return if !input.files || !input.files[0]
    return if @current_file == input.files[0]

    @current_file = input.files[0]
    reader = new FileReader()

    reader.onload = (e) =>
      @$('#userpic-crop').attr('src', e.target.result)
      @$('#userpic-preview').attr('src', e.target.result)
      @init_jcrop()
      console.log('File loaded successfully')

    reader.readAsDataURL(input.files[0])

  update_coordinates: (coords) ->
    $('[name="profile[crop_x]"]').val(coords.x)
    $('[name="profile[crop_y]"]').val(coords.y)
    $('[name="profile[crop_h]"]').val(coords.h)
    $('[name="profile[crop_w]"]').val(coords.w)
    @update_preview(coords)

  update_preview: (coords) ->
    $('#userpic-preview').css
      width: Math.round(150 / coords.w * $('#userpic-crop').width()) + 'px'
      height: Math.round(150 / coords.h * $('#userpic-crop').height()) + 'px'
      marginLeft: '-' + Math.round(150 / coords.w * coords.x) + 'px'
      marginTop: '-' + Math.round(150 / coords.h * coords.y) + 'px'
