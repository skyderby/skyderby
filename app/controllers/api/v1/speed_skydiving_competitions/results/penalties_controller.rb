module Api
  module V1
    module SpeedSkydivingCompetitions
      module Results
        class PenaltiesController < Api::ApplicationController
          include Api::SpeedSkydivingCompetitionScoped
          include Api::EventManagement
          include SpeedSkydivingCompetitionBroadcasts

          def update
            @result = @event.results.find(params[:result_id])

            if @result.update(penalties_attributes: penalties_params)
              broadcast_scoreboard
              render 'api/v1/speed_skydiving_competitions/results/show'
            else
              render_record_errors @result
            end
          end

          private

          def penalties_params
            params.permit(penalties: %i[id percent reason _destroy]).fetch(:penalties, [])
          end
        end
      end
    end
  end
end
