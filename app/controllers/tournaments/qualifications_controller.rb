module Tournaments
  class QualificationsController < ApplicationController
    def show
      response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'

      @tournament = Tournament.find(params[:tournament_id])

      authorize @tournament

      @scoreboard = Qualifications::Scoreboard.new(@tournament)
    end
  end
end
