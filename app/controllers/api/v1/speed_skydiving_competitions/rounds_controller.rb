module Api
  module V1
    module SpeedSkydivingCompetitions
      class RoundsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped
        include Api::EventManagement
        include SpeedSkydivingCompetitionBroadcasts

        before_action :set_round, only: %i[update destroy]

        def create
          @round = @event.rounds.new

          if @round.save
            broadcast_scoreboard
            render :show, status: :created
          else
            render_record_errors @round
          end
        end

        def update
          if @round.update(round_params)
            broadcast_scoreboard
            render :show
          else
            render_record_errors @round
          end
        end

        def destroy
          if @round.destroy
            broadcast_scoreboard
            head :no_content
          else
            render_record_errors @round
          end
        end

        private

        def set_round
          @round = @event.rounds.find(params[:id])
        end

        def round_params = params.require(:round).permit(:completed)
      end
    end
  end
end
