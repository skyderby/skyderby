require 'test_helper'

class Api::V1::Tracks::ReferencePointsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @track = tracks(:hellesylt)
  end

  test '#show returns empty point with editability for guests' do
    get api_v1_track_reference_point_path(@track)

    assert_response :success
    assert_nil response.parsed_body['referencePoint']
    assert_not response.parsed_body['editable']
  end

  test '#show marks own track editable' do
    get api_v1_track_reference_point_path(@track), headers: bearer(:regular_user_read)

    assert_response :success
    assert response.parsed_body['editable']
  end

  test '#update creates and then moves the point' do
    put api_v1_track_reference_point_path(@track),
        params: { reference_point: { latitude: 62.1, longitude: 6.9 } },
        headers: bearer(:regular_user_write)

    assert_response :success
    assert_in_delta 62.1, response.parsed_body.dig('referencePoint', 'latitude')

    put api_v1_track_reference_point_path(@track),
        params: { reference_point: { latitude: 62.2, longitude: 6.8 } },
        headers: bearer(:regular_user_write)

    assert_response :success
    assert_in_delta 6.8, @track.reload.reference_point.longitude
    assert_equal 1, Track::ReferencePoint.where(track: @track).count
  end

  test '#update requires write scope' do
    put api_v1_track_reference_point_path(@track),
        params: { reference_point: { latitude: 62.1, longitude: 6.9 } },
        headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#update forbidden for tracks of other pilots' do
    put api_v1_track_reference_point_path(@track),
        params: { reference_point: { latitude: 62.1, longitude: 6.9 } },
        headers: bearer(:event_responsible_write)

    assert_response :forbidden
    assert_nil @track.reload.reference_point
  end

  test '#destroy removes the point' do
    @track.create_reference_point!(latitude: 62.1, longitude: 6.9)

    delete api_v1_track_reference_point_path(@track), headers: bearer(:regular_user_write)

    assert_response :success
    assert_nil response.parsed_body['referencePoint']
    assert_nil @track.reload.reference_point
  end
end
