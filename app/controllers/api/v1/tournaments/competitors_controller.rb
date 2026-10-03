module Api
  module V1
    module Tournaments
      class CompetitorsController < Api::ApplicationController
        include Api::TournamentManagement
        include CompetitorProfileParams

        before_action :set_competitor, only: %i[update destroy]

        def create
          @competitor = @tournament.competitors.new(competitor_params)

          if @competitor.save
            broadcast_change
            render :show, status: :created
          else
            render_record_errors @competitor
          end
        end

        def update
          if @competitor.update(competitor_params)
            broadcast_change
            render :show
          else
            render_record_errors @competitor
          end
        end

        def destroy
          if @competitor.destroy
            broadcast_change
            head :no_content
          else
            render_record_errors @competitor
          end
        end

        private

        def set_competitor
          @competitor = @tournament.competitors.find(params[:id])
        end

        def broadcast_change
          broadcast_qualification_scoreboard if @tournament.has_qualification
        end

        def editing_event_profile?
          @competitor&.persisted? && @competitor.profile&.owner == @tournament
        end

        def competitor_params
          permitted = params.require(:competitor).permit(
            :profile_id,
            :alias_id,
            :suit_id,
            :is_disqualified,
            :disqualification_reason,
            :photo,
            :sponsor_logo,
            profile_attributes: %i[name country_id]
          )

          resolve_profile(permitted)
        end
      end
    end
  end
end
