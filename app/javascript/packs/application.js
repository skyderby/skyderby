/* eslint no-console:0 */

import { Application } from "stimulus"
import { definitionsFromContext } from "stimulus/webpack-helpers"

// Look for controllers inside app/javascripts/packs/controllers/
const application = Application.start()
const context = require.context("controllers", true, /\.js$/)
application.load(definitionsFromContext(context))

window.$ = window.jQuery = require("jquery");
