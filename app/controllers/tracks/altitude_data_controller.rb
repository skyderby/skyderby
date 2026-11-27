module Tracks
  class AltitudeDataController < ApplicationController
    def show
      return respond_not_authorized unless track.viewable?

      @points = points

      respond_to do |format|
        format.json
      end
    end

    private

    def track
      @track ||= Track.find(params[:track_id])
    end

    def points
      track.recorded_points
    end
  end
end
