require 'test_helper'

class Api::V1::Tracks::PointSeriesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @track = tracks(:hellesylt)
  end

  test '#show returns all points as columns' do
    get api_v1_track_point_series_path(@track)

    assert_response :success
    body = response.parsed_body
    assert_equal 34, body['count']
    %w[gpsTime latitude longitude absAltitude hSpeed vSpeed distance flTime
       horizontalAccuracy verticalAccuracy speedAccuracy].each do |column|
      assert_equal 34, body[column].size, column
    end
    assert_in_delta Time.zone.parse('2018-07-07T16:51:00Z').to_f, body['gpsTime'].first
    assert_in_delta 62.057832, body['latitude'].first
    assert_in_delta 1246.478, body['absAltitude'].first
    assert_equal body['gpsTime'].sort, body['gpsTime']
    assert_nil body['horizontalAccuracy'].first
    assert_predicate response.headers['ETag'], :present?
    assert_predicate response.headers['Last-Modified'], :present?
  end

  test '#show responds not modified for matching etag' do
    get api_v1_track_point_series_path(@track)
    etag = response.headers['ETag']

    get api_v1_track_point_series_path(@track), headers: { 'If-None-Match' => etag }

    assert_response :not_modified
  end

  test '#show returns 404 for private track' do
    @track.private_track!

    get api_v1_track_point_series_path(@track)

    assert_response :not_found
  end

  test '#show allows owner to read private track' do
    @track.update!(owner: users(:regular_user), visibility: :private_track)

    get api_v1_track_point_series_path(@track), headers: bearer(:regular_user_read)

    assert_response :success
  end
end
