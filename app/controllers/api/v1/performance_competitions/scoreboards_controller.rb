module Api
  module V1
    module PerformanceCompetitions
      class ScoreboardsController < Api::ApplicationController
        include Api::PerformanceCompetitionScoped

        def show
          @scoreboard = @event.standings(until_round:, wind_cancellation: wind_cancellation?)
          fresh_when @event
        end
      end
    end
  end
end
