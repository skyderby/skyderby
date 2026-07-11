module PerformanceCompetitions
  class DisplaysController < ApplicationController
    layout 'display'

    def show
      response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'

      @event = PerformanceCompetition.find(params[:performance_competition_id])
      @display = PerformanceCompetition::Display.new(@event)
    end
  end
end
