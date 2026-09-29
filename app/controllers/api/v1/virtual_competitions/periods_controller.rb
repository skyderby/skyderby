module Api
  module V1
    module VirtualCompetitions
      class PeriodsController < Api::ApplicationController
        include Api::VirtualCompetitionRankingScoped

        def show
          raise ActiveRecord::RecordNotFound unless competition.custom_intervals?

          @interval = competition.intervals.find_by!(slug: params[:id])
          scores = competition.interval_top_scores.for(@interval).wind_cancellation(false).includes(ASSOCIATIONS)
          @ranking = highlight(competition.period_ranking(scores, **ranking_params))
        end
      end
    end
  end
end
