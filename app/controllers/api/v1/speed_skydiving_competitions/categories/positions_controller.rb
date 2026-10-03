module Api
  module V1
    module SpeedSkydivingCompetitions
      module Categories
        class PositionsController < Api::ApplicationController
          include Api::SpeedSkydivingCompetitionScoped
          include Api::EventManagement
          include SpeedSkydivingCompetitionBroadcasts

          DIRECTIONS = { 'up' => :move_upper, 'down' => :move_lower }.freeze

          def update
            @category = @event.categories.find(params[:category_id])
            move = DIRECTIONS.fetch(params.require(:direction)) do
              return render_errors ['Direction must be up or down'], status: :unprocessable_content
            end

            @category.public_send(move)
            if @category.errors.empty?
              broadcast_scoreboard
              render 'api/v1/speed_skydiving_competitions/categories/show'
            else
              render_record_errors @category
            end
          end
        end
      end
    end
  end
end
