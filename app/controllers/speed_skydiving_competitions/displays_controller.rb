module SpeedSkydivingCompetitions
  class DisplaysController < ApplicationController
    layout 'display'

    def show
      response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'

      @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
      @display = SpeedSkydivingCompetition::Display.new(@event)
    end
  end
end
