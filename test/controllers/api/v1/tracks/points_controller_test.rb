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
    @track.points.update_all(horizontal_accuracy: 3.7, vertical_accuracy: 5.2)
    options = nil
    query = PointsQuery.method(:execute)

    PointsQuery.stub(:execute, ->(track, opts) { options = opts and query.call(track, opts) }) do
      get api_v1_track_points_url(@track, freq_1_hz: false,
                                          trimmed: { seconds_before_start: 15, seconds_after_end: 120 })
    end

    assert_response :success
    trimmed = { 'seconds_before_start' => '15', 'seconds_after_end' => '120' }
    assert_equal({ freq_1hz: false, trimmed: }, options)
    assert_in_delta 0.5127 * 11, response.parsed_body.first['sep50']
  end

  test '#show - full frequency points' do
    @track.public_track!
    options = nil

    PointsQuery.stub(:execute, ->(_track, opts) { options = opts and [] }) do
      get api_v1_track_points_url(@track, freq_1Hz: false)
    end

    assert_response :success
    assert_equal({ freq_1hz: false, trimmed: true }, options)
  end

  test '#show - private track' do
    @track.private_track!

    get api_v1_track_points_url(@track)

    assert_response :forbidden
  end
end
