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

    assert_in_delta 2.0, track.exit_point.fl_time
  end

  test '#exit_point - nil when jump range is not set' do
    track = track_with_points(ff_start: nil)

    assert_nil track.exit_point
  end

  test '#landing_point - point at the landing time' do
    track = track_with_points(ff_start: 0)
    track.update!(landing_fl_time: 3)

    assert_in_delta 3.0, track.landing_point.fl_time
  end

  test '#landing_point - nil when landing time is unknown' do
    track = track_with_points(ff_start: 0)
    track.update!(landed_at: nil)

    assert_nil track.landing_point
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

  def track_with_points(ff_start:)
    track = create :empty_track, ff_start: ff_start, ff_end: 4
    (0..4).each do |second|
      track.points.create!(
        gps_time_in_seconds: 1_000 + second,
        fl_time: second,
        latitude: 62.0 + second,
        longitude: 6.0 + second,
        abs_altitude: 1_500 - (100 * second)
      )
    end
    track
  end
end
