require 'test_helper'

class Tracks::VideosControllerTest < ActionDispatch::IntegrationTest
  test 'regular user #show allows on public' do
    track = create_track_from_file 'flysight.csv'
    create :track_video, track: track

    get track_video_path(track_id: track.id)
    assert_response :success
  end
end
