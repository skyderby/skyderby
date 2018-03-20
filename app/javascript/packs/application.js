/* eslint no-console:0 */

import { Application } from "stimulus"
import { definitionsFromContext } from "stimulus/webpack-helpers"
import Rails from 'rails-ujs'
import Turbolinks from 'turbolinks'

require('polyfills/element_closest')

window.$ = window.jQuery = require('jquery')
require('jquery-validation')
require('jquery-validation/dist/additional-methods')

window.Highcharts = require('highcharts')
window.HighchartsMore = require('highcharts/highcharts-more')
HighchartsMore(Highcharts)

// Look for controllers inside app/javascripts/packs/controllers/
const application = Application.start()
const context = require.context('controllers', true, /\.js$/)
application.load(definitionsFromContext(context))

Turbolinks.start()
Rails.start()
