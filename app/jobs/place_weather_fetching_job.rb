class PlaceWeatherFetchingJob < ApplicationJob
  def perform(place_id, time_str)
    place = Place.find_by(id: place_id)
    time = Time.parse(time_str)

    return unless place

    PlaceWeatherService.new(place: place, date_time: time).execute
  end
end
