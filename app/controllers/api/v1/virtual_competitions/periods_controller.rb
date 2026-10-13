module Api
  module V1
    module VirtualCompetitions
      class PeriodsController < Api::ApplicationController
        include Api::VirtualCompetitionRankingScoped

        def show
          raise ActiveRecord::RecordNotFound unless competition.custom_intervals?

          @interval = competition.intervals.find_by!(slug: params[:id])
          scores =
            if competition.multi_discipline?
              competition.multi_discipline_standings.for_interval(@interval)
            else
              competition.interval_top_scores.for(@interval).wind_cancellation(false).includes(ASSOCIATIONS)
            end
          @ranking = highlight(competition.period_ranking(scores, **ranking_params))
        end
      end
    end
  end
end
