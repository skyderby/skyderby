/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import { Application } from "stimulus"
import { definitionsFromContext } from "stimulus/webpack-helpers"

// Look for controllers inside app/javascripts/packs/controllers/
const application = Application.start()
const context = require.context("./controllers", true, /\.js$/)
application.load(definitionsFromContext(context))

console.log('Hello World from Webpacker')
