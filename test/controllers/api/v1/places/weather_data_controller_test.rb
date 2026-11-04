require 'test_helper'

class Api::V1::Places::WeatherDataControllerTest < ActionDispatch::IntegrationTest
  setup do
    @place = places(:hellesylt)
    @earlier = Time.zone.parse('2026-05-01T09:00:00Z')
    @latest = Time.zone.parse('2026-05-01T10:00:00Z')
    @place.weather_data.create!(actual_on: @earlier, altitude: 1000, wind_speed: 2, wind_direction: 90)
    @place.weather_data.create!(actual_on: @latest, altitude: 3000, wind_speed: 8.5, wind_direction: 270)
    @place.weather_data.create!(actual_on: @latest, altitude: 1000, wind_speed: 4, wind_direction: 250)
  end

  test '#show returns the latest hour ordered by altitude' do
    get api_v1_place_weather_data_path(@place)

    assert_response :success
    body = response.parsed_body
    assert_equal '2026-05-01T10:00:00Z', body['time']
    assert_equal [1000.0, 3000.0], body['items'].pluck('altitude')
  end

  test '#show returns the requested hour' do
    get api_v1_place_weather_data_path(@place), params: { time: '2026-05-01T09:00:00Z' }

    assert_equal [2.0], response.parsed_body['items'].pluck('windSpeed')
  end

  test '#show is empty for places without weather' do
    get api_v1_place_weather_data_path(places(:loen))

    assert_nil response.parsed_body['time']
    assert_empty response.parsed_body['items']
  end
end
