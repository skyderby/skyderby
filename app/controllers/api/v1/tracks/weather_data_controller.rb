module Api
  module V1
    module Tracks
      class WeatherDataController < Api::ApplicationController
        def show
          track = Track.find(params[:track_id])
          return render_errors(['Not found'], status: :not_found) unless track.viewable?

          @weather_data = track.weather_data.ordered
        end
      end
    end
  end
end
