module Api
  module V1
    module VirtualCompetitions
      class PeriodsController < Api::ApplicationController
        include Api::VirtualCompetitionRankingScoped

        def show
          raise ActiveRecord::RecordNotFound unless competition.custom_intervals?

          @interval = competition.intervals.find_by!(slug: params[:id])
          @ranking = highlight(competition.ranking(interval: @interval, **ranking_params))
        end
      end
    end
  end
end
