describe EventDeletion do
  it 'deletes event' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(event.destroyed?).to be_truthy
  end

  it 'deletes categories' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(Section.where(event: event)).to be_blank
  end

  it 'deletes competitors' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(Competitor.where(event: event)).to be_blank
  end

  it 'deletes rounds' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(Round.where(event: event)).to be_blank
  end

  it 'deletes event tracks' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(EventTrack.where(round: event.rounds)).to be_blank
  end

  it 'deletes tracks if option specified' do
    event = create :event
    section = create :section, event: event
    round = create :round, event: event

    Array.new(3) do |_|
      create(
        :event_track,
        round: round,
        competitor: create(:competitor, event: event, section: section),
        track: create(:empty_track)
      )
    end

    EventDeletion.execute(event, delete_tracks: true)

    tracks = Track.includes(event_track: :round)
                  .where(event_tracks: { rounds: { event: event }})

    expect(tracks).to be_blank
  end
end
