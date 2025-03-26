class Places::WeatherDataController < ApplicationController
  before_action :set_place

  def show
    authorize @place, :show?

    @time =
      if params[:day].present? && params[:hour].present?
        Time.zone.parse("#{params[:day]}T#{params[:hour]}:00:00Z")
      else
        @place.weather_data.order(actual_on: :desc).pick(:actual_on) || Time.zone.now
      end

    @weather_data = @place.weather_data.for_time(@time).order(:altitude)
  end

  private

  def set_place
    @place = Place.find(params[:place_id])
  end
end
