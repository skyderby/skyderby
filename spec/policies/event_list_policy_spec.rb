describe EventListPolicy::Scope do
  it 'public competitions visible to non-participants' do
    user = create :user

    event_array = EventListPolicy::Scope.new(user, EventList.all).resolve.map(&:event)
    expect(event_array).to match_array [
      events(:finished_public),
      events(:published_public),
      speed_skydiving_competitions(:nationals),
      tournaments(:world_base_race),
      tournaments(:qualification_loen)
    ]
  end

  it 'visible all events where organizer' do
    user = create :user

    create :event_organizer, user: user, organizable: events(:draft_public)

    event_array = EventListPolicy::Scope.new(user, EventList.all).resolve.map(&:event)
    expect(event_array).to match_array [
      events(:draft_public),
      events(:published_public),
      events(:finished_public),
      speed_skydiving_competitions(:nationals),
      tournaments(:world_base_race),
      tournaments(:qualification_loen)
    ]
  end

  it 'visible events where user compete' do
    user = create :user

    create :event_competitor, profile: user.profile, event: events(:draft_public)

    event_array = EventListPolicy::Scope.new(user, EventList.all).resolve.map(&:event)
    expect(event_array).to match_array [
      events(:draft_public),
      events(:published_public),
      events(:finished_public),
      speed_skydiving_competitions(:nationals),
      tournaments(:world_base_race),
      tournaments(:qualification_loen)
    ]
  end
end
