module Api
  module V1
    module SpeedSkydivingCompetitions
      class TeamScoreboardsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped

        def show
          raise ActiveRecord::RecordNotFound unless @event.use_teams

          @standings = @event.team_standings
          fresh_when etag: scoreboard_etag
        end
      end
    end
  end
end
