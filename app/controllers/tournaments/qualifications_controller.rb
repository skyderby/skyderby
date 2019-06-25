module Tournaments
  class QualificationsController < ApplicationController
    def show
      @tournament = Tournament.find(params[:tournament_id])

      authorize @tournament

      @scoreboard = Qualifications::Scoreboard.new(@tournament)
    end
  end
end
