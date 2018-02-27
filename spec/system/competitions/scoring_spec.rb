require 'spec_helper'

# Тесты основаны на ручных вычислениях и дополняются 
# вручную выверенными треками. 
feature 'Scoring tracks in competitions', type: :system do
  scenario 'Track from Csaba: distance' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    competition = create_competition
    round = create_round(competition, :distance)

    event_track = create_event_track(competition, round, track)
    expect(event_track.result).to be_within(1).of(2110)
  end

  scenario 'Track from Csaba: speed' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    competition = create_competition
    round = create_round(competition, :speed)

    event_track = create_event_track(competition, round, track)
    expect(event_track.result).to be_within(0.1).of(197.4)
  end

  scenario 'Track from Csaba: time' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    competition = create_competition
    round = create_round(competition, :time)

    event_track = create_event_track(competition, round, track)
    expect(event_track.result).to be_within(0.1).of(38.5)
  end

  scenario 'Track from Alexey: time' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV'
    track.update_columns(place_id: place.id)

    competition = create_competition
    round = create_round(competition, :time)
    event_track = create_event_track(competition, round, track)

    expect(event_track.result).to be_within(0.01).of(92.16)
  end

  scenario 'Track from Alexey: distance' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV'
    track.update_columns(place_id: place.id)

    competition = create_competition
    round = create_round(competition, :distance)
    event_track = create_event_track(competition, round, track)

    expect(event_track.result).to be_within(0.1).of(3410.8)
  end

  scenario 'Track from Alexey: speed' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV'
    track.update_columns(place_id: place.id)

    competition = create_competition
    round = create_round(competition, :speed)
    event_track = create_event_track(competition, round, track)

    expect(event_track.result).to be_within(0.1).of(133.2)
  end

  def create_competition
    @event ||= create(:event)
  end

  def create_round(competition, task)
    @event.rounds.create!(discipline: task)
  end

  def create_event_track(competition, round, track)
    create(:event_track, round: round, track_id: track.id)
  end
end
