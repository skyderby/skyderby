class Skyderby.views.WeatherDataForm extends Backbone.View

  template: JST['app/templates/weather_data_form']

  tagName: 'div'

  className: 'modal-dialog'

  can_manage: false

  initialize: (opts) ->
    @modalView = new Skyderby.views.ModalView
    @collection = new Skyderby.collections.WeatherData(parent_url: opts.parent_url)
    @collection.on('reset add', @render_table, this)
    @collection.fetch(reset: true)

    @can_manage = opts.can_manage if _.has(opts, 'can_manage')
    @default_date = opts.default_date if _.has(opts, 'default_date')

  render: ->
    modal_title = 'Weather data'

    @modalView.$el.html(@$el.html(@template(title: modal_title)))

    # @listenTo(@modalView, 'modal:shown', @onModalShown);
    @listenTo(@modalView, 'modal:hidden', @on_modal_hidden);
    this

  open: ->
    @modalView.show()
    this

  on_modal_hidden: ->
    @$el.remove()

  render_table: ->
    table = @$('#weather-table')
    table.find('tbody').remove()
    tbody = @$('#weather-table').append('<tbody>')
    @collection.each (row) =>
      row_view = new Skyderby.views.WeatherDataRow(model: row, can_manage: @can_manage)
      row_view.render()
      tbody.append(row_view.el)

    if @can_manage
      weather_datum_form = new Skyderby.views.WeatherDatumForm
        collection: @collection,
        default_date: @default_date

      weather_datum_form.render()
      table.append(weather_datum_form.el)
