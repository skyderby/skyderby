module Api
  module V1
    class PerformanceCompetitionSeriesController < Api::ApplicationController
      def show
        @series = ::PerformanceCompetitionSeries.find(params[:id])
        raise ActiveRecord::RecordNotFound unless @series.viewable?

        fresh_when etag: [@series, @series.competitions.maximum(:updated_at), @series.rounds.maximum(:updated_at)]
      end
    end
  end
end
