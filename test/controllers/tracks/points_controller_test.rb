require 'test_helper'

class Tracks::PointsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @track = tracks(:hellesylt)
    @track.update!(visibility: :public_track, ff_start: 5, ff_end: 20)
  end

  test '#show - points within the jump by default' do
    get track_points_url(@track, format: :json)

    assert_response :success
    assert_equal 16, response.parsed_body['points'].size
  end

  test '#show - every point when trimming is off' do
    get track_points_url(@track, format: :json, trimmed: 'false')

    assert_equal 34, response.parsed_body['points'].size
  end

  test '#show - jump extended by the requested seconds' do
    get track_points_url(@track, format: :json, trimmed: { seconds_before_start: 2, seconds_after_end: 3 })

    assert_equal 21, response.parsed_body['points'].size
  end
end
