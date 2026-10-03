module Api
  module V1
    module Tournaments
      class QualificationRoundsController < Api::ApplicationController
        include Api::TournamentManagement

        before_action :set_round, only: %i[update destroy]

        def create
          @round = @tournament.qualification_rounds.new

          if @round.save
            broadcast_qualification_scoreboard
            render :show, status: :created
          else
            render_record_errors @round
          end
        end

        def update
          if @round.update(params.require(:round).permit(:completed))
            broadcast_qualification_scoreboard
            render :show
          else
            render_record_errors @round
          end
        end

        def destroy
          if @round.destroy
            broadcast_qualification_scoreboard
            head :no_content
          else
            render_record_errors @round
          end
        end

        private

        def set_round
          @round = @tournament.qualification_rounds.find(params[:id])
        end
      end
    end
  end
end
