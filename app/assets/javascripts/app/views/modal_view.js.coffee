class Skyderby.views.ModalView extends Backbone.View
  el: '#modal'

  events:
    'shown.bs.modal' : 'onModalShown',
    'hidden.bs.modal': 'onModalHidden'

  show: ->
    @$el.modal('show')

  hide: ->
    @$el.modal('hide')

  onModalShown: ->
    @trigger('modal:shown')

  onModalHidden: ->
    @trigger('modal:hidden')
