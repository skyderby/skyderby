require 'test_helper'

class Api::V1::Tracks::PlacesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @neighbour = places(:hellesylt)
  end

  test '#new returns defaults and nearby suggestions' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)

    get new_api_v1_track_place_path(track), headers: bearer(:regular_user_read)

    assert_response :success
    body = response.parsed_body
    assert_equal 'base', body['kind']
    assert body['anchorAvailable']
    assert_includes body['suggestions'].pluck('id'), @neighbour.id
  end

  test '#new is forbidden for a foreign track' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)

    get new_api_v1_track_place_path(track), headers: bearer(:event_responsible_write)

    assert_response :forbidden
  end

  test '#create adds a place and assigns it to the track' do
    track = base_track_at(62.5, 7.5)

    assert_difference ['Place.count', 'Place::Submission.count'], 1 do
      post api_v1_track_place_path(track),
           params: { place: { name: 'New exit', country_id: countries(:norway).id, msl: 900 } },
           headers: bearer(:regular_user_write)
    end

    assert_response :created
    assert_equal 'New exit', response.parsed_body['name']
    assert_equal Place.last, track.reload.place
  end

  test '#create reports a duplicate nearby' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)

    assert_no_difference 'Place.count' do
      post api_v1_track_place_path(track),
           params: { place: { name: 'Dup', country_id: countries(:norway).id } },
           headers: bearer(:regular_user_write)
    end

    assert_response :unprocessable_content
  end

  test '#create requires the write scope' do
    track = base_track_at(62.5, 7.5)

    post api_v1_track_place_path(track), params: { place: { name: 'X' } }, headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  private

  def base_track_at(latitude, longitude)
    track = Track.create!(
      pilot: profiles(:regular_user), owner: users(:regular_user), kind: :base,
      visibility: :public_track, ff_start: 0, ff_end: 10
    )
    Point.create!(
      track:, fl_time: 0, gps_time_in_seconds: Time.zone.parse('2024-07-07T12:00:00Z').to_f,
      latitude:, longitude:, abs_altitude: 1200
    )
    track
  end
end
