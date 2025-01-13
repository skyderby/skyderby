require 'test_helper'

class ScoringTracksInCompetitionsTest < ActiveSupport::TestCase
  test 'Track from Csaba: distance' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    round = create_round(:distance)

    event_track = create_event_track(round, track)
    assert_in_delta 2110, event_track.result, 1
  end

  test 'Track from Csaba: speed' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    round = create_round(:speed)

    event_track = create_event_track(round, track)
    assert_in_delta 197.4, event_track.result, 0.1
  end

  test 'Track from Csaba: time' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    round = create_round(:time)

    event_track = create_event_track(round, track)
    assert_in_delta 38.5, event_track.result, 0.1
  end

  test 'Track from Alexey: time' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV', place_id: place.id

    round = create_round(:time)
    event_track = create_event_track(round, track)

    assert_in_delta 92.16, event_track.result, 0.01
  end

  test 'Track from Alexey: distance' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV', place_id: place.id

    round = create_round(:distance)
    event_track = create_event_track(round, track)

    assert_in_delta 3410.8, event_track.result, 0.1
  end

  test 'Track from Alexey: speed' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV', place_id: place.id

    round = create_round(:speed)
    event_track = create_event_track(round, track)

    assert_in_delta 133.2, event_track.result, 0.1
  end

  private

  def event
    @event ||= events(:nationals)
  end

  def create_round(task)
    event.rounds.create!(discipline: task)
  end

  def create_event_track(round, track)
    create(:event_result, round:, track_id: track.id)
  end
end
