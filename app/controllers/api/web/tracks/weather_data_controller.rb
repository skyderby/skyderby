class Api::Web::Tracks::WeatherDataController < Api::Web::ApplicationController
  def show
    authorize track

    @weather_data = track.weather_data
  end

  private

  def track
    @track ||= Track.find(params[:track_id])
  end
end
