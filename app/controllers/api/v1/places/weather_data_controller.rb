module Api
  module V1
    module Places
      class WeatherDataController < Api::ApplicationController
        def show
          place = Place.find(params[:place_id])
          @time = requested_time || place.weather_data.order(actual_on: :desc).pick(:actual_on)
          @weather_data = @time ? place.weather_data.for_time(@time).order(:altitude) : place.weather_data.none
        end

        private

        def requested_time
          return if params[:time].blank?

          Time.zone.parse(params[:time].to_s)
        rescue ArgumentError
          nil
        end
      end
    end
  end
end
