require 'test_helper'

class Tracks::PlacesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @country = countries(:norway)
    @neighbour = places(:hellesylt)
  end

  test '#new offers nearby locations of the same kind' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)
    sign_in @user

    get new_track_place_path(track), as: :turbo_stream

    assert_response :success
    assert_match @neighbour.name, @response.body
  end

  test '#new is not available for a foreign track' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)
    sign_in users(:places_editor)

    get new_track_place_path(track), as: :turbo_stream

    assert_no_match 'modal-root', @response.body
  end

  test '#new is not available for a guest' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)

    get new_track_place_path(track), as: :turbo_stream

    assert_no_match 'modal-root', @response.body
  end

  test '#create takes BASE coordinates from the exit point and records a submission' do
    track = base_track_at(62.5, 7.5)
    sign_in @user

    assert_difference ['Place.count', 'Place::Submission.count'], 1 do
      post track_place_path(track), as: :turbo_stream, params: { place: place_params }
    end

    place = Place.last
    assert_redirected_to track_path(track)
    assert_equal 'base', place.kind
    assert_in_delta 62.5, place.latitude.to_f, 0.000001
    assert_in_delta 7.5, place.longitude.to_f, 0.000001
    assert_equal place, track.reload.place
    assert_equal @user, place.submission.user
    assert_equal track, place.submission.track
  end

  test '#create ignores coordinates submitted for a BASE track' do
    track = base_track_at(62.5, 7.5)
    sign_in @user

    post track_place_path(track), as: :turbo_stream, params: { place: place_params(latitude: 10, longitude: 10) }

    place = Place.last
    assert_in_delta 62.5, place.latitude.to_f, 0.000001
    assert_in_delta 7.5, place.longitude.to_f, 0.000001
  end

  test '#create refuses a location next to an existing one' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)
    sign_in @user

    assert_no_difference ['Place.count', 'Place::Submission.count'] do
      post track_place_path(track), as: :turbo_stream, params: { place: place_params }
    end

    assert_response :unprocessable_content
    assert_match @neighbour.name, @response.body
  end

  test '#create ignores allow_duplicate coming from a regular user' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)
    sign_in @user

    assert_no_difference 'Place.count' do
      post track_place_path(track), as: :turbo_stream, params: { place: place_params(allow_duplicate: '1') }
    end

    assert_response :unprocessable_content
  end

  test '#create lets an admin save a duplicate on purpose' do
    track = base_track_at(@neighbour.latitude, @neighbour.longitude)
    track.update!(owner: users(:admin), pilot: profiles(:admin))
    sign_in users(:admin)

    assert_difference 'Place.count', 1 do
      post track_place_path(track), as: :turbo_stream, params: { place: place_params(allow_duplicate: '1') }
    end

    assert_redirected_to track_path(track)
  end

  test '#create takes skydive coordinates and elevation from the landing point' do
    track = skydive_track
    sign_in @user

    post track_place_path(track), as: :turbo_stream, params: { place: place_params(latitude: 45.555, longitude: 6.555) }

    place = Place.last
    assert_equal 'skydive', place.kind
    assert_in_delta 45.555, place.latitude.to_f, 0.000001
    assert_in_delta 6.555, place.longitude.to_f, 0.000001
    assert_equal place.msl, track.reload.ground_level
  end

  test '#create refuses skydive coordinates far away from the track' do
    track = skydive_track
    sign_in @user

    assert_no_difference 'Place.count' do
      post track_place_path(track), as: :turbo_stream,
                                    params: { place: place_params(latitude: 10, longitude: 10) }
    end

    assert_response :unprocessable_content
  end

  test '#create refuses coordinates that are not numbers' do
    track = skydive_track
    sign_in @user

    assert_no_difference 'Place.count' do
      post track_place_path(track), as: :turbo_stream,
                                    params: { place: place_params(latitude: 'abc', longitude: 'xyz') }
    end

    assert_response :unprocessable_content
  end

  private

  def place_params(overrides = {})
    { name: 'New location', country_id: @country.id }.merge(overrides)
  end

  def base_track_at(latitude, longitude)
    track = Track.create!(
      pilot: profiles(:regular_user),
      owner: @user,
      kind: :base,
      visibility: :public_track,
      ff_start: 0,
      ff_end: 10
    )

    add_point(track, fl_time: 0, latitude: latitude, longitude: longitude, abs_altitude: 1200)
    track
  end

  def skydive_track
    track = Track.create!(
      pilot: profiles(:regular_user),
      owner: @user,
      kind: :skydive,
      visibility: :public_track,
      ff_start: 0,
      ff_end: 10
    )

    add_point(track, fl_time: 0, latitude: 45.5, longitude: 6.5, abs_altitude: 4000)
    add_point(track, fl_time: 60, latitude: 45.55, longitude: 6.55, abs_altitude: 420)
    track.update!(landing_fl_time: 60)
    track
  end

  def add_point(track, fl_time:, latitude:, longitude:, abs_altitude:)
    Point.create!(
      track: track,
      fl_time: fl_time,
      gps_time_in_seconds: Time.zone.parse('2024-07-07T12:00:00Z').to_f + fl_time,
      latitude: latitude,
      longitude: longitude,
      abs_altitude: abs_altitude
    )
  end
end
