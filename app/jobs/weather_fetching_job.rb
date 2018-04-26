class WeatherFetchingJob < ApplicationJob
  def perform
    next_hour = Time.current.beginning_of_hour + 1.hour

    Place.skydive.each do |place|
      PlaceWeatherService.new(place: place, date_time: next_hour).execute
    end
  end
end

Sidekiq::Cron::Job.create(
  name: 'Fetch weather - every hour',
  cron: '30 * * * *',
  class: 'WeatherFetchingJob'
)
