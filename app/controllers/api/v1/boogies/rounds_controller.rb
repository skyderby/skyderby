module Api
  module V1
    module Boogies
      class RoundsController < Api::ApplicationController
        include Api::BoogieScoped
        include Api::EventManagement
        include BoogieScoreboardBroadcasts

        def create
          @round = @event.rounds.new(discipline: :distance)

          if @round.save
            broadcast_scoreboards
            render :show, status: :created
          else
            render_record_errors @round
          end
        end

        def destroy
          round = @event.rounds.find(params[:id])

          if round.destroy
            broadcast_scoreboards
            head :no_content
          else
            render_record_errors round
          end
        end
      end
    end
  end
end
