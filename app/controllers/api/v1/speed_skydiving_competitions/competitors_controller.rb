module Api
  module V1
    module SpeedSkydivingCompetitions
      class CompetitorsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped
        include Api::EventManagement
        include SpeedSkydivingCompetitionBroadcasts
        include CompetitorProfileParams

        before_action :set_competitor, only: %i[update destroy]

        def create
          @competitor = @event.competitors.new
          @competitor.assign_attributes(competitor_params)

          if @competitor.save
            broadcast_scoreboard
            render :show, status: :created
          else
            render_record_errors @competitor
          end
        end

        def update
          if @competitor.update(competitor_params)
            @event.touch # rubocop:disable Rails/SkipsModelValidations
            broadcast_scoreboard
            render :show
          else
            render_record_errors @competitor
          end
        end

        def destroy
          if @competitor.destroy
            broadcast_scoreboard
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
            :assigned_number, :category_id, :team_id, :profile_id, :alias_id, :photo,
            profile_attributes: %i[name country_id]
          )
          scope_to_event(permitted, :category_id, @event.categories)
          scope_to_event(permitted, :team_id, @event.teams)

          resolve_profile(permitted)
        end

        def scope_to_event(permitted, key, relation)
          permitted[key] = relation.find(permitted[key]).id if permitted[key].present?
        end
      end
    end
  end
end
