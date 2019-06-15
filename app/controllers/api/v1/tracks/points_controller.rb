module Api
  module V1
    module Tracks
      class PointsController < ApplicationController
        def show
          authorize track

          @points =
            PointsQuery
            .execute(track, options)
            .then { |points| PointsPostprocessor.for(track.gps_type).call(points) }
        end

        private

        def track
          @track ||= Track.find(params[:track_id])
        end

        def options
          default_options.merge show_params
        end

        def show_params
          params.permit(:freq_1Hz, trimmed: {}).to_h.symbolize_keys
        end

        def default_options
          { freq_1hz: true, trimmed: true }
        end
      end
    end
  end
end
