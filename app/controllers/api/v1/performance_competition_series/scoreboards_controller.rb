module Api
  module V1
    module PerformanceCompetitionSeries
      class ScoreboardsController < Api::ApplicationController
        def show
          @series = ::PerformanceCompetitionSeries.find(params[:performance_competition_series_id])
          raise ActiveRecord::RecordNotFound unless @series.viewable?

          @scoreboard = ::PerformanceCompetitionSeries::Scoreboard.new(@series, params.permit(:display_raw_results))
          fresh_when etag: [@series, @series.competitions.maximum(:updated_at), @series.rounds.maximum(:updated_at)]
        end
      end
    end
  end
end
