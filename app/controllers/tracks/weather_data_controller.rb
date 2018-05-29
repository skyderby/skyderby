module Tracks
  class WeatherDataController < ApplicationController
    def show
      @weather_data = Tracks::WeatherData.new(track, index_params)

      respond_to do |format|
        format.html { redirect_to track }
        format.js
      end
    end

    private

    def track
      @track ||= Track.find(params[:track_id])
    end

    def index_params
      params.permit(:altitude_unit, :wind_speed_unit)
    end
    helper_method :index_params
  end
end
