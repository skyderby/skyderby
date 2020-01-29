module Api
  module V1
    module Tracks
      class WeatherDataController < ApplicationController
        def show
          authorize track

          @weather_data = track.weather_data
        end

        private

        def track
          @track ||= Track.find(params[:track_id])
        end
      end
    end
  end
end
