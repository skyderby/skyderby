import { Application } from '@hotwired/stimulus'
import { definitionsFromContext } from '@hotwired/stimulus-webpack-helpers'
import Rails from '@rails/ujs'
import '@hotwired/turbo-rails'
import 'utils/googleAnalytics'
import 'utils/amplitude'

import Honeybadger from '@honeybadger-io/js'
const currentEnvMeta = document.querySelector('meta[name="current-env"]')
const honeybadgerApiKeyMeta = document.querySelector('meta[name="hb-api-key"]')
if (currentEnvMeta && honeybadgerApiKeyMeta && currentEnvMeta.content === 'production') {
  Honeybadger.configure({
    apiKey: honeybadgerApiKeyMeta.content,
    environment: currentEnvMeta.content
  })
}

import jQuery from 'jquery'

window.Rails = Rails
window.$ = window.jQuery = jQuery

import 'jquery-jcrop'
import 'jquery-validation'
import 'jquery-validation/dist/additional-methods'
import 'bootstrap/js/modal'
import 'bootstrap/js/tooltip'
import 'utils/bootstrap'

import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'

window.Highcharts = Highcharts
window.HighchartsMore = HighchartsMore

HighchartsMore(Highcharts)

import 'utils/google_maps_api'
import 'utils/cesium_api'
import 'utils/chartSeriesSettings'
// Look for controllers inside app/javascripts/packs/controllers/
const application = Application.start()

// eslint-disable-next-line no-undef
const context = require.context('controllers', true, /\.js$/)
application.load(definitionsFromContext(context))

import { createConsumer } from '@rails/actioncable'
window.cable = createConsumer()

Rails.start()

if (window.parent !== window) {
  document.documentElement.classList.add('inside-iframe')
}
