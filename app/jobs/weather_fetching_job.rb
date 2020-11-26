class WeatherFetchingJob < ApplicationJob
  def perform
    next_hour = Time.current.beginning_of_hour + 1.hour

    Place.skydive.each do |place|
      PlaceWeatherFetchingJob.perform_later(place.id, next_hour.iso8601)
    end
  end
end

if Rails.env.production?
  Sidekiq::Cron::Job.create(
    name: 'Fetch weather - every hour',
    cron: '30 * * * *',
    class: 'WeatherFetchingJob'
  )
end
