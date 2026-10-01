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
