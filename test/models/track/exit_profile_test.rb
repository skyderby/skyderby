require 'test_helper'

class Track::ExitProfileTest < ActiveSupport::TestCase
  test 'samples distance for every 5 meters of drop' do
    track = create_jump(glide_ratio: 1.5)

    Track::ExitProfile.recalculate(track)
    exit_profile = track.reload.exit_profile

    assert_equal 61, exit_profile.distances.size
    assert_in_delta 0, exit_profile.distances.first, 0.1
    assert_in_delta 75, exit_profile.distances[10], 2
    assert_in_delta 450, exit_profile.distances.last, 5
    assert_in_delta 300, exit_profile.reference_distance, 3
  end

  test 'skips jumps that do not reach 300 meters of drop' do
    track = create_jump(glide_ratio: 1.5, seconds: 20)

    Track::ExitProfile.recalculate(track)

    assert_nil track.reload.exit_profile
  end

  test 'skips jumps with an impossible glide ratio' do
    track = create_jump(glide_ratio: 3.0)

    Track::ExitProfile.recalculate(track)

    assert_nil track.reload.exit_profile
  end

  test 'skips jumps with gaps in data' do
    track = create_jump(glide_ratio: 1.5)
    track.points.where(fl_time: 10..14).delete_all

    Track::ExitProfile.recalculate(track)

    assert_nil track.reload.exit_profile
  end

  test 'refreshes the aggregate of the suit a track is moved away from' do
    other_suit = suits(:nala)
    4.times { create_aggregated_profile(other_suit) }
    track = create_jump(glide_ratio: 1.5, suit: other_suit)
    Track::ExitProfile.recalculate(track)

    assert_equal 5, performance_for(other_suit).tracks_count

    track.update!(suit: suits(:oneshot))
    Track::ExitProfile.recalculate(track)

    assert_equal 4, performance_for(other_suit).tracks_count
  end

  test 'removes a stored profile when the suit is unassigned' do
    track = create_jump(glide_ratio: 1.5)
    Track::ExitProfile.recalculate(track)
    assert_predicate track.reload.exit_profile, :present?

    track.update!(suit: nil)
    Track::ExitProfile.recalculate(track)

    assert_nil track.reload.exit_profile
  end

  private

  def performance_for(suit)
    Profile::ExitPerformance.find_by(profile_id: profiles(:alex).id, suit_id: suit.id)
  end

  def create_aggregated_profile(suit)
    track = Track.create!(pilot: profiles(:alex), suit:, kind: :base, recorded_at: 1.year.ago)
    distances = Track::ExitProfile.drops.map { |drop| (drop * 1.5).round(1) }

    Track::ExitProfile.create!(
      track:, profile_id: profiles(:alex).id, suit_id: suit.id, recorded_at: track.recorded_at,
      distances:, reference_distance: distances[Track::ExitProfile.reference_index]
    )
  end

  def create_jump(glide_ratio:, seconds: 60, pilot: profiles(:alex), suit: suits(:apache))
    track = Track.create!(
      pilot:, suit:, kind: :base, visibility: :public_track,
      place: places(:hellesylt), recorded_at: 1.day.ago,
      ff_start: 0, ff_end: seconds, ground_level: 100
    )

    start_time = Time.zone.parse('2026-07-01T10:00:00Z').to_f
    (0..seconds).each do |second|
      drop = 10.0 * second
      Point.create!(
        track:,
        gps_time_in_seconds: start_time + second,
        fl_time: second,
        abs_altitude: 2000 - drop,
        latitude: 62.0 + ((drop * glide_ratio) / (Skyderby::Geospatial::EARTH_RADIUS_M * Math::PI / 180)),
        longitude: 6.9,
        h_speed: 10.0 * glide_ratio * 3.6,
        v_speed: 36.0
      )
    end

    track
  end
end
