describe EventTracks::FileDuplicationValidator do
  it 'adds error if duplicate found' do
    profile = create :profile, name: 'PILOT_NAME'
    track = create_track_from_file 'flysight.csv'
    track.update!(pilot: profile)
    section = create :event_section, event: event
    competitor = create :event_competitor, section: section, profile: profile
    round = create :event_round, event: event, discipline: Event::Round.disciplines['distance'], number: 2
    event_track = create :event_result, competitor: competitor, round: round, track: track

    track_file = create :track_file

    EventTracks::FileDuplicationValidator.call(event_track, track_file)

    expect(event_track.errors.count).to eq(1)
    expect(event_track.errors.full_messages.first).to eq(
      'File already used. Pilot: PILOT_NAME, round: Distance - 1'
    )
  end

  it 'returns false if no duplicates found' do
    event_track = create :event_result
    track_file = create :track_file

    EventTracks::FileDuplicationValidator.call(event_track, track_file)

    expect(event_track.errors.count).to eq(0)
  end

  def event
    @event ||= create :event
  end
end
