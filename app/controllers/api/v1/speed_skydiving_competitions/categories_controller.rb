module Api
  module V1
    module SpeedSkydivingCompetitions
      class CategoriesController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped
        include Api::EventManagement
        include SpeedSkydivingCompetitionBroadcasts

        before_action :set_category, only: %i[update destroy]

        def create
          @category = @event.categories.new(category_params)

          if @category.save
            broadcast_scoreboard
            render :show, status: :created
          else
            render_record_errors @category
          end
        end

        def update
          if @category.update(category_params)
            broadcast_scoreboard
            render :show
          else
            render_record_errors @category
          end
        end

        def destroy
          if @category.destroy
            broadcast_scoreboard
            head :no_content
          else
            render_record_errors @category
          end
        end

        private

        def set_category
          @category = @event.categories.find(params[:id])
        end

        def category_params = params.require(:category).permit(:name)
      end
    end
  end
end
