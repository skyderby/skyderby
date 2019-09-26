module Api
  module V1
    module Events
      module Results
        class PenaltiesController < ApplicationController
          def update
            @event = Event.find(params[:event_id])
            @result = @event.results.find(params[:result_id])

            if @result.update(penalty_params)
              head :ok
            else
              render { json: { errors: @result.errors } }
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
