require 'test_helper'

class Tracks::MapsControllerTest < ActionDispatch::IntegrationTest
  test 'regular user #show allows on public' do
    track = create_track_from_file 'flysight.csv'

    get track_map_path(track_id: track.id)
    assert_response :success
  end
end
