import { Application } from 'stimulus'
import { definitionsFromContext } from 'stimulus/webpack-helpers'
import Rails from 'rails-ujs'
import Turbolinks from 'turbolinks'

import Honeybadger from 'honeybadger-js/honeybadger'
Honeybadger.configure({
  apiKey: window.HB_API_KEY,
  environment: window.ENVIRONMENT_NAME
})

import 'polyfills/element_closest'
import jQuery from 'jquery'

window.Rails = Rails
window.$ = window.jQuery = jQuery

import 'jquery-jcrop'
import 'jquery-validation'
import 'jquery-validation/dist/additional-methods'
import 'ion.rangeSlider'
import 'bootstrap/js/alert'
import 'bootstrap/js/button'
import 'bootstrap/js/dropdown'
import 'bootstrap/js/modal'
import 'bootstrap/js/tab'
import 'bootstrap/js/tooltip'
import 'utils/bootstrap'

import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'

window.Highcharts = Highcharts
window.HighchartsMore = HighchartsMore

HighchartsMore(Highcharts)

import 'utils/google_maps_api'
import 'utils/cesium_api'
import 'utils/chart_series_settings'
// Look for controllers inside app/javascripts/packs/controllers/
const application = Application.start()

// eslint-disable-next-line no-undef
const context = require.context('controllers', true, /\.js$/)
application.load(definitionsFromContext(context))

import ActionCable from 'actioncable'
window.cable = ActionCable.createConsumer()

Turbolinks.start()
Rails.start()
