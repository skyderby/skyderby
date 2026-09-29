module Api
  module V1
    module SpeedSkydivingCompetitions
      class OpenScoreboardsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped

        def show
          @scoreboard = SpeedSkydivingCompetition::OpenScoreboard.new(@event, until_round:)
          fresh_when etag: scoreboard_etag
        end
      end
    end
  end
end
