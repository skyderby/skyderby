module Api
  module V1
    module VirtualCompetitions
      class OverallsController < Api::ApplicationController
        include Api::VirtualCompetitionRankingScoped

        def show
          @ranking = highlight(competition.ranking(**ranking_params))
        end
      end
    end
  end
end
