module Tournaments
  module Qualifications
    class RoundsController < ApplicationController
      include TournamentScoped
      include RespondWithScoreboard

      before_action :authorize_tournament

      def create
        @round = @tournament.qualification_rounds.new

        if @round.save
          respond_with_scoreboard
        else
          respond_with_errors(@round.errors)
        end
      end

      def destroy
        @round = @tournament.qualification_rounds.find(params[:id])

        if @round.destroy
          respond_with_scoreboard
        else
          respond_with_errors(@round.errors)
        end
      end

      private

      def authorize_tournament
        authorize @tournament, :update?
      end
    end
  end
end
