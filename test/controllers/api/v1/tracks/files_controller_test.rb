require 'test_helper'

class Api::Web::Tracks::FilesControllerTest < ActionDispatch::IntegrationTest
  test '#create - flysight file with one segment' do
    params = { file: fixture_file_upload('tracks/distance_2454.csv') }

    post api_v1_track_files_url, params: params

    assert_response :success
    assert_equal 'flysight', response.parsed_body['fileFormat']
    assert_equal 1, response.parsed_body['segmentsCount']
    assert_predicate response.parsed_body['id'], :positive?
  end

  test 'garmin file with multiple segments' do
    params = { file: fixture_file_upload('tracks/two_tracks.gpx') }

    post api_v1_track_files_url, params: params

    assert_response :success
    assert_equal 'gpx', response.parsed_body['fileFormat']
    assert_equal 3, response.parsed_body['segmentsCount']
    assert_predicate response.parsed_body['id'], :positive?
    assert_equal(
      [
        { 'name' => 'ACTIVE LOG: 20 SEP 2014 15:10', 'hUp' => 561, 'hDown' => 3970, 'pointsCount' => 388 },
        { 'name' => 'ACTIVE LOG: 20 SEP 2014 16:57', 'hUp' => 832, 'hDown' => 4002, 'pointsCount' => 428 },
        { 'name' => 'ACTIVE LOG- 2: 20 SEP 2014 15:10', 'hUp' => 557, 'hDown' => 3970, 'pointsCount' => 387 }
      ],
      response.parsed_body['segments']
    )
  end

  test 'invalid file' do
    params = { file: fixture_file_upload('skyderby_logo.png') }

    post api_v1_track_files_url, params: params

    assert_response :unprocessable_entity
    assert_equal(
      { 'errors' => { 'file' => ['extension must be one of: csv, gpx, tes, kml'] } },
      response.parsed_body
    )
  end
end
