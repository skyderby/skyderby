module Tracks
  class JumpRangesController < ApplicationController
    def show
      track = Track.find(params[:track_id])
      points = PointsQuery.execute(
        track,
        only: %i[gps_time fl_time h_speed v_speed]
      )
      @jump_range = TrackScanner.call(points)
    end
  end
end
