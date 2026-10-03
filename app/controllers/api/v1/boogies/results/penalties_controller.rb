module Api
  module V1
    module Boogies
      module Results
        class PenaltiesController < Api::ApplicationController
          include Api::BoogieScoped
          include Api::EventManagement
          include BoogieScoreboardBroadcasts

          def update
            @result = @event.results.find(params[:result_id])

            if @result.update(penalty_params)
              broadcast_scoreboards
              render 'api/v1/boogies/results/show'
            else
              render_record_errors @result
            end
          end

          private

          def penalty_params
            params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
          end
        end
      end
    end
  end
end
