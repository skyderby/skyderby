module Api
  module V1
    module PerformanceCompetitions
      class OpenScoreboardsController < Api::ApplicationController
        include Api::PerformanceCompetitionScoped

        def show
          @scoreboard = @event.open_standings(until_round:, wind_cancellation: wind_cancellation?)
          fresh_when @event
        end
      end
    end
  end
end
