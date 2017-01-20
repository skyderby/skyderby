class WeatherCheckingJob < ApplicationJob
  def perform(track_id)
    track = Track.find_by(id: track_id)
    return if track.base? || !track&.place

    gps_time = track.points.trimmed.first.gps_time

    PlaceWeatherService.new(place: track.place, date_time: gps_time)
  end
end
