describe 'Scoring tracks in competitions', type: :system, skip: true do
  it 'Track from Csaba: distance' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    round = create_round(:distance)

    event_track = create_event_track(round, track)
    expect(event_track.result).to be_within(1).of(2110)
  end

  it 'Track from Csaba: speed' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    round = create_round(:speed)

    event_track = create_event_track(round, track)
    expect(event_track.result).to be_within(0.1).of(197.4)
  end

  it 'Track from Csaba: time' do
    track = create_track_from_file '2014-Csaba-Round-1.CSV'
    round = create_round(:time)

    event_track = create_event_track(round, track)
    expect(event_track.result).to be_within(0.1).of(38.5)
  end

  it 'Track from Alexey: time' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV', place_id: place.id

    round = create_round(:time)
    event_track = create_event_track(round, track)

    expect(event_track.result).to be_within(0.01).of(92.16)
  end

  it 'Track from Alexey: distance' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV', place_id: place.id

    round = create_round(:distance)
    event_track = create_event_track(round, track)

    expect(event_track.result).to be_within(0.1).of(3410.8)
  end

  it 'Track from Alexey: speed' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file '13-31-51_Ravenna.CSV', place_id: place.id

    round = create_round(:speed)
    event_track = create_event_track(round, track)

    expect(event_track.result).to be_within(0.1).of(133.2)
  end

  def event
    @event ||= events(:draft_public)
  end

  def create_round(task)
    event.rounds.create!(discipline: task)
  end

  def create_event_track(round, track)
    create(:event_result, round: round, track_id: track.id)
  end
end
