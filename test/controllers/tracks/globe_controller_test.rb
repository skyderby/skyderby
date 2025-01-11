require 'test_helper'

class Tracks::GlobeControllerTest < ActionDispatch::IntegrationTest
  test 'regular user #show allows on public' do
    track = create_track_from_file 'flysight.csv'

    get track_globe_path(track_id: track.id)
    assert_response :success
  end
end
