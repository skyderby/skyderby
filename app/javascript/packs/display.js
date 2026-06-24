import { Application } from '@hotwired/stimulus'
import SlideshowController from '../display/slideshow_controller'
import ReplayController from '../display/replay_controller'

const application = Application.start()
application.register('slideshow', SlideshowController)
application.register('replay', ReplayController)
