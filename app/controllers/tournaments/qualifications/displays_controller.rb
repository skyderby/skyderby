module Tournaments
  module Qualifications
    class DisplaysController < ApplicationController
      layout 'display'

      def show
        response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'

        @tournament = Tournament.find(params[:tournament_id])
        @scoreboard = Tournament::Qualification::Scoreboard.new(@tournament)
        @competitors = @scoreboard.competitors.select(&:ranked?)
      end
    end
  end
end
