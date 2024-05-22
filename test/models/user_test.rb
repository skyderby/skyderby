describe User, type: :model do
  describe '#create' do
    it 'creates profile' do
      user = User.create!(
        email: 'example@example.com',
        password: 'changeme',
        password_confirmation: 'changeme',
        profile_attributes: { name: 'Testy McUserton' }
      )

      expect(user.profile).not_to be_nil
    end
  end

  it '#responsible_of_events' do
    user = users(:regular_user)
    event = create :event, responsible: user

    expect(user.responsible_of_events).to include event
  end

  describe '#organizer_of_event?' do
    it 'when responsible of event' do
      user = users(:regular_user)
      event = create :event, responsible: user

      expect(user.organizer_of_event?(event)).to be_truthy
    end

    it 'when responsible of tournament' do
      user = users(:regular_user)
      tournament = tournaments(:world_base_race)

      expect(user.organizer_of_event?(tournament)).to be_truthy
    end
  end
end
