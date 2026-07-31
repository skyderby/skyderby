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
end
