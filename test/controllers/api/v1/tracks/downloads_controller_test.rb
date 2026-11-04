require 'test_helper'

class Api::V1::Tracks::DownloadsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @track = tracks(:hellesylt)
    @track.update!(track_file: Track::File.create!(file: fixture_file_upload('tracks/flysight.csv', 'text/csv')))
  end

  test '#show sends the original file to the pilot' do
    get api_v1_track_download_path(@track), headers: bearer(:regular_user_read)

    assert_response :success
    assert_includes response.headers['Content-Disposition'], 'flysight.csv'
  end

  test '#show refuses other users' do
    get api_v1_track_download_path(tracks(:boogie_track_1)), headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#show requires authentication' do
    get api_v1_track_download_path(@track)

    assert_response :unauthorized
  end

  test 'track details tell the pilot the file can be downloaded' do
    get api_v1_track_path(@track), headers: bearer(:regular_user_read)

    body = response.parsed_body
    assert body['downloadable']
    assert_equal 'flysight.csv', body['fileName']
    assert body['loggable']
  end
end
