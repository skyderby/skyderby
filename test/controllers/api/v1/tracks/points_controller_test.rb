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

  test '#show - private track' do
    @track.private_track!

    get api_v1_track_points_url(@track)

    assert_response :forbidden
  end
end
