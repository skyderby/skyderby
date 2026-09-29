module Api
  module V1
    class SpeedSkydivingCompetitionSeriesController < Api::ApplicationController
      def show
        @series = ::SpeedSkydivingCompetitionSeries.find(params[:id])
        raise ActiveRecord::RecordNotFound unless @series.viewable?

        fresh_when etag: [@series, @series.competitions.maximum(:updated_at), @series.rounds.count]
      end
    end
  end
end
