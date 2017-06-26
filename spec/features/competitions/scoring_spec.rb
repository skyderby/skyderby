require 'spec_helper'

# Тесты основаны на ручных вычислениях и дополняются 
# вручную выверенными треками. 
feature 'Scoring tracks in competitions' do
  scenario 'Track from Michael Cooper: distance' do
    track = create_track_from_file 'flysight.csv'
    competition = create_competition
    round = create_round(competition, :distance)

    event_track = create_event_track(competition, round, track)
    expect(event_track.result).to be_within(1).of(1474)
  end

  scenario 'Track from Michael Cooper: speed' do
    track = create_track_from_file 'flysight.csv'
    competition = create_competition
    round = create_round(competition, :speed)

    event_track = create_event_track(competition, round, track)
    expect(event_track.result).to be_within(0.1).of(164.3)
  end

  scenario 'Track from Michael Cooper: time' do
    track = create_track_from_file 'flysight.csv'
    competition = create_competition
    round = create_round(competition, :time)

    event_track = create_event_track(competition, round, track)
    expect(event_track.result).to be_within(0.1).of(32.3)
  end

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

  def create_competition
    @event ||= create(:event)
  end

  def create_round(competition, task)
    @event.rounds.create!(discipline: task)
  end

  def create_event_track(competition, round, track)
    create(:event_track, round: round, track_id: track.id)
  end

  def create_track_from_file filename
    pilot = create :pilot
    suit = create :wingsuit

    track_file = TrackFile.create(
      file: File.new("#{Rails.root}/spec/support/tracks/#{filename}")
    )

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      user: pilot.owner,
      wingsuit: suit
    }
    CreateTrackService.new(params).execute
  end
end
