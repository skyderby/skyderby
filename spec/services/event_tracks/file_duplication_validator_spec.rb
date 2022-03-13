describe EventTracks::FileDuplicationValidator do
  let(:user) { users(:event_responsible) }
  let(:event) { Event.create!(name: 'Where duplicate occurs', responsible: user, starts_at: 1.day.ago) }
  let(:suit) { suits(:apache) }
  let(:category) { event.sections.create!(name: 'Open') }
  let(:profile) { Profile.create!(name: 'PILOT_NAME') }
  let(:competitor) { event.competitors.create!(section: category, profile: profile, suit: suit) }

  it 'adds error if duplicate found' do
    track = create_track_from_file 'flysight.csv', pilot: profile, suit: suit
    round = event.rounds.create!(discipline: :distance, number: 2)
    event_track = round.results.create! \
      competitor: competitor,
      track: track,
      result: 200,
      uploaded_by: user.profile

    track_file = Track::File.create!(file: File.open(file_fixture('tracks/flysight.csv')))

    EventTracks::FileDuplicationValidator.call(event_track, track_file)

    expect(event_track.errors.count).to eq(1)
    expect(event_track.errors.full_messages.first).to eq(
      'File already used. Pilot: PILOT_NAME, round: Distance - 1'
    )
  end

  it 'returns false if no duplicates found' do
    round = event.rounds.create!(discipline: :distance, number: 1)
    result = round.results.create! \
      competitor: competitor,
      track: create_track_from_file('distance_2454.csv', pilot: profile, suit: suit),
      result: 300,
      uploaded_by: user.profile

    track_file = Track::File.create!(file: File.open(file_fixture('tracks/flysight.csv')))

    EventTracks::FileDuplicationValidator.call(result, track_file)

    expect(result.errors.count).to eq(0)
  end
end
