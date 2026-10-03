module Api
  module V1
    module Boogies
      module Categories
        class PositionsController < Api::ApplicationController
          include Api::BoogieScoped
          include Api::EventManagement
          include BoogieScoreboardBroadcasts

          DIRECTIONS = { 'up' => :move_upper, 'down' => :move_lower }.freeze

          def update
            @category = @event.categories.find(params[:category_id])
            direction = DIRECTIONS[params.require(:direction)]
            return render_errors(['Direction must be up or down'], status: :unprocessable_content) unless direction

            @category.public_send(direction)
            if @category.errors.empty?
              broadcast_scoreboards
              render 'api/v1/boogies/categories/show'
            else
              render_record_errors @category
            end
          end
        end
      end
    end
  end
end
