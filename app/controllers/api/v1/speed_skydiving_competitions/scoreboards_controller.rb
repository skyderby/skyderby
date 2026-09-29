module Api
  module V1
    module SpeedSkydivingCompetitions
      class ScoreboardsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped

        def show
          @scoreboard = @event.standings(until_round:)
          fresh_when etag: scoreboard_etag
        end
      end
    end
  end
end
