module Tracks
  class JumpRangesController < ApplicationController
    def show
      track = Track.find(params[:track_id])

      authorize track, :edit?

      points = PointsQuery.execute(
        track,
        only: %i[gps_time fl_time abs_altitude h_speed v_speed]
      )

      @jump_range = TrackScanner.call(points)
    end
  end
end
