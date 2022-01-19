describe SpeedSkydivingCompetition::Competitor do
  describe 'Russia restrictions on 1st category events' do
    let(:restricted_event) do
      SpeedSkydivingCompetition.create! \
        name: 'Restricted Event',
        place: places(:ravenna),
        starts_at: '2021-09-01',
        is_official: true,
        responsible: users(:event_responsible)
    end

    let(:not_restricted_event) do
      SpeedSkydivingCompetition.create! \
        starts_at: '2021-09-01',
        place: places(:ravenna),
        name: 'Not-Restricted Event',
        is_official: false,
        responsible: users(:event_responsible)
    end

    let(:russian_person) { Profile.create! name: 'Natural Athlete', country: countries(:russia) }
    let(:norwegian_person) { Profile.create! name: 'Natural Athlete', country: countries(:norway) }

    it 'russian competitor in restricted event' do
      competitor = restricted_event.competitors.create! \
        profile: russian_person,
        category: restricted_event.categories.create!(name: 'Open')

      expect(competitor.country_code).to eq('RPF')
      expect(competitor.country_name).to eq('Neutral Athletes')
    end

    it 'norwegian competitor in restricted event' do
      competitor = restricted_event.competitors.create! \
        profile: norwegian_person,
        category: restricted_event.categories.create!(name: 'Open')

      expect(competitor.country_code).to eq('NOR')
      expect(competitor.country_name).to eq('Norway')
    end

    it 'russian competitor in non-restricted event' do
      competitor = not_restricted_event.competitors.create! \
        profile: russian_person,
        category: not_restricted_event.categories.create!(name: 'Open')

      expect(competitor.country_code).to eq('RUS')
      expect(competitor.country_name).to eq('Russia')
    end
  end
end
