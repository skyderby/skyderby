describe EventListPolicy::Scope do
  it 'public competitions visible to non-participants' do
    events = create_events
    user = create :user

    event_array = EventListPolicy::Scope.new(user, EventList.all).resolve.map(&:event)
    expect(event_array).to match_array [events[:public_finished]]
  end

  it 'visible all events where organizer' do
    events = create_events
    user = create :user

    create :event_organizer, user: user, organizable: events[:public_draft]

    event_array = EventListPolicy::Scope.new(user, EventList.all).resolve.map(&:event)
    expect(event_array).to match_array [events[:public_draft], events[:public_finished]]
  end

  it 'visible events where user compete' do
    events = create_events
    user = create :user

    create :competitor, profile: user.profile, event: events[:public_draft]

    event_array = EventListPolicy::Scope.new(user, EventList.all).resolve.map(&:event)
    expect(event_array).to match_array [events[:public_draft], events[:public_finished]]
  end

  def create_events
    @events ||= {
      public_draft:      create(:event, status: Event.statuses[:draft],    visibility: Event.visibilities[:public_event]),
      public_finished:   create(:event, status: Event.statuses[:finished], visibility: Event.visibilities[:public_event]),
      unlisted_finished: create(:event, status: Event.statuses[:finished], visibility: Event.visibilities[:unlisted_event]),
      private_finished:  create(:event, status: Event.statuses[:finished], visibility: Event.visibilities[:private_event])
    }
  end
end
