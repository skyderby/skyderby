module Events
  module Rounds
    module Maps
      class PenaltiesController < ApplicationController
        include EventScoped
        before_action :set_event, :authorize_event, :set_round, :set_result

        def show
          respond_to do |format|
            format.js
          end
        end

        def update
          respond_to do |format|
            if @result.update(penalty_params)
              format.js
            else
              respond_with_errors(@result.errors)
            end
          end
        end

        private

        def set_round
          @round = @event.rounds.find(params[:round_id])
        end

        def set_result
          @result = @round.results.find(params[:id])
        end

        def penalty_params
          params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
        end
      end
    end
  end
end
