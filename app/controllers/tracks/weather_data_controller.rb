module Tracks
  class WeatherDataController < ApplicationController
    def show
      @weather_data = track.weather_data

      respond_to do |format|
        format.html { redirect_to track }
        format.turbo_stream
        format.json
      end
    end

    private

    def track
      @track ||= Track.find(params[:track_id])
    end
  end
end
