describe Events::CompetitorRegistration do
  describe '#create' do
    it 'create competitor with existed profile' do
      profile = create :profile

      params = {
        event_id: event.id,
        section_id: section.id,
        suit_id: suit.id,
        profile_id: profile.id
      }

      Events::CompetitorRegistration.new(params).create

      expect(event.competitors.count).to eq(1)
    end

    it 'create competitor with new profile' do
      country = create :country
      name = 'Ivan'

      params = {
        event_id: event.id,
        section_id: section.id,
        suit_id: suit.id,
        new_profile: 'true',
        name: name,
        country_id: country.id
      }

      Events::CompetitorRegistration.new(params).create

      expect(event.competitors.count).to eq(1)
      expect(event.competitors.first.name).to eq(name)
    end
  end

  describe '#update' do
    it 'update with existed profile' do
      competitor = create :competitor, event: event, section: section, suit: suit
      profile = create :profile

      params = {
        id: competitor.id,
        event_id: event.id,
        section_id: section.id,
        suit_id: suit.id,
        profile_id: profile.id
      }

      Events::CompetitorRegistration.new(params).update

      expect(event.competitors.first.profile).to eq(profile)
    end

    it 'update with new profile' do
      competitor = create :competitor, event: event, section: section, suit: suit
      country = create :country
      name = 'Ivan'

      params = {
        id: competitor.id,
        event_id: event.id,
        section_id: section.id,
        suit_id: suit.id,
        new_profile: 'true',
        name: name,
        country_id: country.id
      }

      Events::CompetitorRegistration.new(params).update

      expect(event.competitors.first.name).to eq(name)
    end
  end

  def event
    @event ||= create :event
  end

  def section
    @section ||= create :section, event: event
  end

  def suit
    @suit ||= create :suit
  end
end
