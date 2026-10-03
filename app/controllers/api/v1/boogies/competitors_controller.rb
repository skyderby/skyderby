module Api
  module V1
    module Boogies
      class CompetitorsController < Api::ApplicationController
        include Api::BoogieScoped
        include Api::EventManagement
        include BoogieScoreboardBroadcasts
        include CompetitorProfileParams

        before_action :set_competitor, only: %i[update destroy]

        def create
          @competitor = @event.competitors.new
          @competitor.assign_attributes(competitor_params)

          if @competitor.save
            broadcast_scoreboards
            render :show, status: :created
          else
            render_record_errors @competitor
          end
        end

        def update
          if @competitor.update(competitor_params)
            broadcast_scoreboards
            render :show
          else
            render_record_errors @competitor
          end
        end

        def destroy
          if @competitor.destroy
            broadcast_scoreboards
            head :no_content
          else
            render_record_errors @competitor
          end
        end

        private

        def set_competitor
          @competitor = @event.competitors.find(params[:id])
        end

        def competitor_params
          permitted = params.require(:competitor).permit(
            :assigned_number, :category_id, :suit_id, :profile_id, :alias_id, :photo,
            profile_attributes: %i[name country_id]
          )

          resolve_profile(with_section(permitted))
        end

        def with_section(permitted)
          return permitted unless permitted.key?(:category_id)

          category_id = permitted.delete(:category_id)
          permitted.merge(section_id: category_id.presence && @event.categories.find(category_id).id)
        end
      end
    end
  end
end
