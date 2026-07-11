import '@hotwired/turbo-rails'
import { Application } from '@hotwired/stimulus'
import SlideshowController from '../display/slideshow_controller'
import ReplayController from '../display/replay_controller'
import RefreshController from '../display/refresh_controller'
import SpeedFallController from '../display/speed_fall_controller'
import PerformanceReplayController from '../display/performance_replay_controller'

const application = Application.start()
application.register('slideshow', SlideshowController)
application.register('replay', ReplayController)
application.register('refresh', RefreshController)
application.register('speed-fall', SpeedFallController)
application.register('performance-replay', PerformanceReplayController)
