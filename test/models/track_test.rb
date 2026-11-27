require 'test_helper'

class TrackTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  test 'rescores online competitions when visibility changes' do
    track = create :empty_track, visibility: Track.visibilities[:private_track]

    assert_enqueued_with job: OnlineCompetitionJob, args: [track.id] do
      track.update!(visibility: Track.visibilities[:public_track])
    end
  end

  test 'does not rescore online competitions when visibility is unchanged' do
    track = create :empty_track, visibility: Track.visibilities[:public_track]

    assert_no_enqueued_jobs only: OnlineCompetitionJob do
      track.update!(comment: 'Updated comment')
    end
  end

  test 'validations - requires name if pilot not specified' do
    track = tracks(:hellesylt)
    track.pilot = nil
    track.name = nil

    assert_not_predicate track, :valid?
  end

  test 'validations - not require name if pilot specified' do
    track = tracks(:hellesylt)
    track.pilot = create :profile
    track.name = nil

    assert_predicate track, :valid?
  end

  test '#destroy - can not destroy if track has competition result' do
    track = tracks(:hellesylt)
    event_results(:john_distance_1).update_columns(track_id: track.id)

    track.destroy
    assert_not track.destroyed?
  end

  test '#destroy - cleans up online competition results ' do
    online_competition = virtual_competitions(:base_race)
    track = create :empty_track
    online_competition.results.create!(track: track, result: 123)

    assert_difference -> { online_competition.results.count } => -1 do
      track.destroy
    end
  end

  test '#delete - can not be deleted if track has competition result' do
    track = create :empty_track
    event_results(:john_distance_1).update_columns(track_id: track.id)

    assert_raises ActiveRecord::InvalidForeignKey do
      track.delete
    end
  end

  test '#exit_point - first point at or after the start of the jump range' do
    track = track_with_points(ff_start: 2)

    assert_equal Time.zone.at(1_002), track.exit_point.gps_time
  end

  test '#ff_start - whole seconds from the first point to the exit' do
    track = track_with_points(ff_start: 0)
    track.update!(exited_at: Time.zone.at(Rational(10_027, 10)))

    assert_equal 2, track.ff_start
  end

  test '#ff_start= keeps the precise exit time when the seconds are unchanged' do
    track = track_with_points(ff_start: 0)
    exited_at = Time.zone.at(Rational(10_017, 10))
    track.update!(exited_at:)

    track.update!(jump_range: '1;4')

    assert_equal exited_at.to_r, track.reload.exited_at.to_r
  end

  test '#ff_start= moves the exit time to the given seconds after the first point' do
    track = track_with_points(ff_start: 0)

    track.update!(jump_range: '2.5;4')

    assert_equal Rational(2_005, 2), track.reload.exited_at.to_r
    assert_equal 2, track.ff_start
  end

  test '#exit_point - nil when jump range is not set' do
    track = track_with_points(ff_start: nil)

    assert_nil track.exit_point
  end

  test '#landing_point - point at the landing time' do
    track = track_with_points(ff_start: 0)
    track.update!(landing_fl_time: 3)

    assert_equal Time.zone.at(1_003), track.landing_point.gps_time
  end

  test '#landing_point - nil when landing time is unknown' do
    track = track_with_points(ff_start: 0)
    track.update!(landed_at: nil)

    assert_nil track.landing_point
  end

  test '#msl_offset - landing point altitude when ground level is unknown' do
    track = track_with_points(ff_start: 0)
    track.update!(landing_fl_time: 3)

    assert_in_delta 1_200.0, track.msl_offset
  end

  test '#msl_offset - ignores inaccurate points when landing is unknown' do
    track = track_with_points(ff_start: 0, first: { abs_altitude: -555, vertical_accuracy: 4_331 })
    track.update!(landed_at: nil)

    assert_in_delta 1_100.0, track.msl_offset
  end

  test '#msl_offset - minimum altitude when every point is inaccurate' do
    track = track_with_points(ff_start: 0, all: { vertical_accuracy: 50 })
    track.update!(landed_at: nil)

    assert_in_delta 1_100.0, track.msl_offset
  end

  test '#delete_online_competitions_results - deletes all results' do
    online_competition = virtual_competitions(:skydive_distance_wingsuit)
    track = create :empty_track
    results = [
      online_competition.results.create!(track: track, result: 123),
      online_competition.results.create!(track: track, result: 123, wind_cancelled: true)
    ]

    assert_changes -> { online_competition.results.where(id: results.map(&:id)).count }, from: 2, to: 0 do
      track.delete_online_competitions_results
    end
  end

  private

  def track_with_points(ff_start:, first: {}, all: {})
    track = create :empty_track
    rows = (0..4).map do |second|
      {
        gps_time: 1_000 + second,
        latitude: 62.0 + second,
        longitude: 6.0 + second,
        abs_altitude: 1_500 - (100 * second),
        **all,
        **(second.zero? ? first : {})
      }
    end
    record_points(track, rows, jump_range: ff_start..4)
    track
  end
end
