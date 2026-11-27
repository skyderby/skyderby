module Api
  module V1
    module Tracks
      class PointSeriesController < Api::ApplicationController
        def show
          track = Track.find(params[:track_id])
          return render_errors(['Not found'], status: :not_found) unless track.viewable?

          @point_series = Track::PointSeries.new(track, speed_units:)
          fresh_when etag: [track, speed_units], last_modified: track.updated_at
        end
      end
    end
  end
end
