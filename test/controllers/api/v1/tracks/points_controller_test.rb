require 'test_helper'

class Api::V1::Tracks::PointsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @track = tracks(:hellesylt)
  end

  test '#show - public track' do
    @track.public_track!

    get api_v1_track_points_url(@track)

    assert_response :success
    assert_equal 34, response.parsed_body.count
  end

  test '#show - original frequency trimmed around the jump with sep50' do
    @track.public_track!
    size = @track.point_arrays.size
    @track.point_arrays.update!(horizontal_accuracy: Array.new(size, 3.7), vertical_accuracy: Array.new(size, 5.2))
    expected = @track.freefall_points.extended(before: 15, after: 120)

    get api_v1_track_points_url(@track, freq_1_hz: false, trimmed: { seconds_before_start: 15, seconds_after_end: 120 })

    assert_response :success
    assert_equal expected.size, response.parsed_body.count
    assert_in_delta 0.5127 * 11, response.parsed_body.first['sep50']
  end

  test '#show - 1 Hz points within the jump by default' do
    @track.public_track!

    get api_v1_track_points_url(@track)

    assert_response :success
    assert_equal @track.freefall_points.at_1hz.size, response.parsed_body.count
  end

  test '#show - speeds in km/h by default and in m/s when asked' do
    @track.public_track!

    get api_v1_track_points_url(@track)
    kmh = response.parsed_body.first['h_speed']

    get api_v1_track_points_url(@track, units: 'ms')

    assert_response :success
    assert_in_delta kmh / 3.6, response.parsed_body.first['h_speed'], 1e-9
  end

  test '#show - private track' do
    @track.private_track!

    get api_v1_track_points_url(@track)

    assert_response :forbidden
  end
end
