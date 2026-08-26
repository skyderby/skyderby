require 'test_helper'

class CreateTrackServiceTest < ActiveSupport::TestCase
  test '#call - saves track' do
    track = CreateTrackService.call(valid_params)
    assert_predicate track, :persisted?
  end

  test '#call - records exit and deploy timestamps' do
    track = CreateTrackService.call(valid_params)

    assert_predicate track.exited_at, :present?
    assert_predicate track.deployed_at, :present?
    assert_operator track.deployed_at, :>, track.exited_at
  end

  test 'activity data validation - marks track as require to review' do
    track = CreateTrackService.call(with_missing_activity_data)
    assert track.require_range_review
  end

  test '#call - detects the real jump on a noisy flysight2 climb' do
    track = CreateTrackService.call(noisy_flysight2_params)

    assert_not track.require_range_review
    assert_in_delta 407, track.ff_start, 5
    assert_in_delta 542, track.ff_end, 5
  end

  test '#call - assigns the place closest to the landing point for a skydive track' do
    probe = CreateTrackService.call(params_without_place)
    exit_point = probe.exit_point
    landing_point = probe.landing_point

    assert_not_nil landing_point
    assert_operator Skyderby::Geospatial.distance_between_points(exit_point, landing_point), :>, 1000

    near_exit = place_at(exit_point, msl: 100)
    near_landing = place_at(landing_point, msl: 200)

    track = CreateTrackService.call(params_without_place)

    assert_equal near_landing, track.place
    assert_not_equal near_exit, track.place
    assert_equal 200, track.ground_level
  end

  test '#call - assigns the place closest to the exit point for a BASE track' do
    probe = CreateTrackService.call(params_without_place)
    near_exit = place_at(probe.exit_point, msl: 100, kind: :base)
    place_at(probe.landing_point, msl: 200, kind: :base)

    track = CreateTrackService.call(params_without_place.merge(kind: :base))

    assert_equal near_exit, track.place
    assert_equal 100, track.ground_level
  end

  test '#call - ignores places of another activity' do
    probe = CreateTrackService.call(params_without_place)
    place_at(probe.landing_point, msl: 200, kind: :base)

    track = CreateTrackService.call(params_without_place)

    assert_nil track.place
  end

  def params_without_place
    valid_params.except(:place)
  end

  def place_at(point, msl:, kind: :skydive)
    create :place, latitude: point.latitude, longitude: point.longitude, msl: msl, kind: kind
  end

  def valid_params
    @valid_params ||= begin
      place = create :place
      profile = create :profile
      suit = create :suit

      {
        track_file_id: track_file.id,
        kind: :skydive,
        place: place,
        pilot: profile,
        suit: suit
      }
    end
  end

  def with_missing_activity_data
    file = fixture_file_upload('tracks/flysight_warmup.csv')
    track_file_with_missing_activity = Track::File.create!(file: file)

    valid_params.merge(track_file_id: track_file_with_missing_activity.id)
  end

  def noisy_flysight2_params
    file = fixture_file_upload('tracks/flysight2_2762_noisy_climb.csv')
    noisy_track_file = Track::File.create!(file: file)

    valid_params.merge(track_file_id: noisy_track_file.id)
  end

  def track_file
    @track_file ||= Track::File.create!(
      file: File.open(file_fixture('tracks/flysight.csv'))
    )
  end
end
