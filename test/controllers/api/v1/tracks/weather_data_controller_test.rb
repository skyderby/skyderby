require 'test_helper'

class Api::V1::Tracks::WeatherDataControllerTest < ActionDispatch::IntegrationTest
  setup do
    @track = tracks(:hellesylt)
    @track.update!(kind: :skydive)
  end

  test '#show returns weather data for track hours' do
    hour = Time.zone.parse('2018-07-07T16:00:00Z')
    places(:hellesylt).weather_data.create!(actual_on: hour, altitude: 3000, wind_speed: 8.5, wind_direction: 270)
    places(:hellesylt).weather_data.create!(actual_on: hour, altitude: 1000, wind_speed: 4, wind_direction: 250)

    get api_v1_track_weather_data_path(@track)

    assert_response :success
    assert_equal(
      [
        { 'actualOn' => hour.iso8601, 'altitude' => 1000.0, 'windSpeed' => 4.0, 'windDirection' => 250.0 },
        { 'actualOn' => hour.iso8601, 'altitude' => 3000.0, 'windSpeed' => 8.5, 'windDirection' => 270.0 }
      ],
      response.parsed_body['items']
    )
  end

  test '#show returns empty list without weather data' do
    get api_v1_track_weather_data_path(@track)

    assert_response :success
    assert_empty response.parsed_body['items']
  end

  test '#show returns 404 for private track' do
    @track.private_track!

    get api_v1_track_weather_data_path(@track)

    assert_response :not_found
  end
end
