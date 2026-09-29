module Api
  module V1
    module Tracks
      class PointSeriesController < Api::ApplicationController
        def show
          track = Track.find(params[:track_id])
          return render_errors(['Not found'], status: :not_found) unless track.viewable?

          @point_series = Track::PointSeries.new(track)
          fresh_when track
        end
      end
    end
  end
end
