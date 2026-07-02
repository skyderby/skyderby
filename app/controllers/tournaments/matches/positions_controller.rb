module Tournaments
  module Matches
    class PositionsController < ApplicationController
      include TournamentScoped

      DIRECTIONS = %w[up down].freeze

      before_action :authorize_action

      def update
        return head(:unprocessable_content) unless DIRECTIONS.include?(params[:direction])

        match = @tournament.matches.find(params[:match_id])
        match.move(params[:direction])

        respond_with_scoreboard
      end

      private

      def authorize_action
        authorize @tournament, :update?
      end
    end
  end
end
