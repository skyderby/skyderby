require 'test_helper'

class MissingWeatherFetchingJobTest < ActiveJob::TestCase
  test 'returns without error when the track has no trimmed points' do
    track = create(:empty_track, :with_place)

    assert_nothing_raised do
      MissingWeatherFetchingJob.perform_now(track.id)
    end
  end

  test 'logs the forecast hour when the download fails' do
    track = create(:empty_track, :with_place)
    track.points.create!(gps_time: Time.zone.parse('2020-01-01 12:34:56 UTC').to_f,
                         fl_time: 0, abs_altitude: 0)
    forecast_hour = track.points.trimmed.first.gps_time.beginning_of_hour

    failure = Struct.new(:success, :errors).new(false, ['boom'])
    fake_forecast = Object.new
    fake_forecast.define_singleton_method(:download) { |&_block| failure }

    assert_difference -> { WeatherFetchingLog.count }, 1 do
      GfsForecast.stub(:new, fake_forecast) do
        MissingWeatherFetchingJob.perform_now(track.id)
      end
    end

    assert_equal forecast_hour, WeatherFetchingLog.last.time
  end
end
