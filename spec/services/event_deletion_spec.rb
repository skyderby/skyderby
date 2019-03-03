describe EventDeletion do
  it 'deletes event' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(event.destroyed?).to be_truthy
  end

  it 'deletes categories' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(Event::Section.where(event: event)).to be_blank
  end

  it 'deletes competitors' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(Event::Competitor.where(event: event)).to be_blank
  end

  it 'deletes rounds' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(Event::Round.where(event: event)).to be_blank
  end

  it 'deletes event tracks' do
    event = events(:published_public)

    EventDeletion.execute(event)
    expect(Event::Result.where(round: event.rounds)).to be_blank
  end

  it 'deletes tracks if option specified' do
    event = create :event
    section = create :event_section, event: event
    round = create :event_round, event: event

    Array.new(3) do |_|
      create(
        :event_result,
        round: round,
        competitor: create(:event_competitor, event: event, section: section),
        track: create(:empty_track)
      )
    end

    EventDeletion.execute(event, delete_tracks: true)

    tracks = Track.includes(event_result: :round)
                  .where(event_results: { event_rounds: { event_id: event.id } })

    expect(tracks).to be_blank
  end
end
