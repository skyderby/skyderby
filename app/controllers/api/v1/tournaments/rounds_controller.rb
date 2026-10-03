module Api
  module V1
    module Tournaments
      class RoundsController < Api::ApplicationController
        include Api::TournamentManagement

        def create
          @round = @tournament.rounds.new

          if @round.save
            render :show, status: :created
          else
            render_record_errors @round
          end
        end

        def destroy
          round = @tournament.rounds.find(params[:id])

          if round.destroy
            head :no_content
          else
            render_record_errors round
          end
        end
      end
    end
  end
end
