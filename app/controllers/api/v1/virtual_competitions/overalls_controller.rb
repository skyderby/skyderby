module Api
  module V1
    module VirtualCompetitions
      class OverallsController < Api::ApplicationController
        include Api::VirtualCompetitionRankingScoped

        def show
          scores = competition.personal_top_scores.wind_cancellation(false).includes(ASSOCIATIONS)
          @ranking = highlight(competition.overall_ranking(scores, **ranking_params))
        end
      end
    end
  end
end
