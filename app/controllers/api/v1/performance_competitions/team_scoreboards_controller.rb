module Api
  module V1
    module PerformanceCompetitions
      class TeamScoreboardsController < Api::ApplicationController
        include Api::PerformanceCompetitionScoped

        def show
          raise ActiveRecord::RecordNotFound unless @event.use_teams

          @standings = @event.team_standings(until_round:, wind_cancellation: wind_cancellation?)
          fresh_when @event
        end
      end
    end
  end
end
