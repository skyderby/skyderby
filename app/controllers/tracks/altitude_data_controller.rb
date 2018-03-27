module Tracks
  class AltitudeDataController < ApplicationController
    def show
      authorize track

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
      PointsQuery.execute(track, freq_1Hz: true, only: %i[fl_time altitude])
    end
  end
end
