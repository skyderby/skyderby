describe EventDeletion do
  it 'deletes event' do
    event = create :event
    EventDeletion.execute(event)
    expect(event.destroyed?).to be_truthy
  end

  it 'deletes categories' do
    event = create :event
    Array.new(3) { |_| create :section, event: event }

    EventDeletion.execute(event)
    expect(Section.where(event: event)).to be_blank
  end

  it 'deletes competitors' do
    event = create :event
    section = create :section, event: event
    Array.new(3) { |_| create :competitor, event: event, section: section }

    EventDeletion.execute(event)
    expect(Competitor.where(event: event)).to be_blank
  end

  it 'deletes rounds' do
    event = create :event
    Array.new(3) { |_| create :round, event: event }

    EventDeletion.execute(event)
    expect(Round.where(event: event)).to be_blank
  end

  it 'deletes event tracks' do
    event = create :event
    section = create :section, event: event
    round = create :round, event: event
    track = create :empty_track

    Array.new(3) do |_|
      create(
        :event_track,
        round: round,
        competitor: create(:competitor, event: event, section: section),
        track: track
      )
    end

    EventDeletion.execute(event)
    expect(EventTrack.all).to be_blank
  end

  it 'deletes profiles if option specified' do

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
    expect(Track.all).to be_blank
  end
end
