module Api
  module V1
    module Boogies
      class CategoriesController < Api::ApplicationController
        include Api::BoogieScoped
        include Api::EventManagement
        include BoogieScoreboardBroadcasts

        before_action :set_category, only: %i[update destroy]

        def create
          @category = @event.categories.new(category_params)

          if @category.save
            broadcast_scoreboards
            render :show, status: :created
          else
            render_record_errors @category
          end
        end

        def update
          if @category.update(category_params)
            broadcast_scoreboards
            render :show
          else
            render_record_errors @category
          end
        end

        def destroy
          if @category.destroy
            broadcast_scoreboards
            head :no_content
          else
            render_record_errors @category
          end
        end

        private

        def set_category
          @category = @event.categories.find(params[:id])
        end

        def category_params
          params.require(:category).permit(:name)
        end
      end
    end
  end
end
