import { Application } from '@hotwired/stimulus'
import { definitionsFromContext } from '@hotwired/stimulus-webpack-helpers'
import '@hotwired/turbo-rails'
import 'utils/amplitude'

import 'utils/google_maps_api'
// Look for controllers inside app/javascripts/packs/controllers/
const application = Application.start()

// eslint-disable-next-line no-undef
const context = require.context('controllers', true, /\.js$/)
application.load(definitionsFromContext(context))

import { createConsumer } from '@rails/actioncable'
window.cable = createConsumer()

if (window.parent !== window) {
  document.documentElement.classList.add('inside-iframe')
}
