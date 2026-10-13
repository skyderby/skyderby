module Api
  module V1
    module VirtualCompetitions
      class OverallsController < Api::ApplicationController
        include Api::VirtualCompetitionRankingScoped

        def show
          scores =
            if competition.multi_discipline?
              competition.multi_discipline_standings.overall
            else
              competition.personal_top_scores.wind_cancellation(false).includes(ASSOCIATIONS)
            end
          @ranking = highlight(competition.overall_ranking(scores, **ranking_params))
        end
      end
    end
  end
end
