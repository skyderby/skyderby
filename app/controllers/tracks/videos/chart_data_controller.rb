module Tracks
  module Videos
    class ChartDataController < ApplicationController
      def show
        return respond_not_authorized unless track.editable?

        fresh_when track

        @points = track.freefall_points.extended(before: 20.seconds).at_1hz
      end

      def track
        @track ||= Track.find(params[:track_id])
      end
    end
  end
end
