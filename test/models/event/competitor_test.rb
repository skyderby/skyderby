# == Schema Information
#
# Table name: competitors
#
#  id         :integer          not null, primary key
#  event_id   :integer
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#  suit_id    :integer
#  name       :string(510)
#  section_id :integer
#  profile_id :integer
#

require 'support/event_ongoing_validation'

describe Event::Competitor do
  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { event_competitors(:competitor_1) }
  end

  describe 'Russia restrictions on 1st category events' do
    let(:restricted_event) do
      Event.create! rules: :speed_distance_time,
                    name: 'Restricted Event',
                    starts_at: '2021-09-01',
                    is_official: true,
                    responsible: users(:event_responsible)
    end

    let(:not_restricted_event) do
      Event.create! rules: :speed_distance_time,
                    starts_at: '2021-09-01',
                    name: 'Not-Restricted Event',
                    is_official: false,
                    responsible: users(:event_responsible)
    end

    let(:russian_person) { Profile.create! name: 'Natural Athlete', country: countries(:russia) }
    let(:norwegian_person) { Profile.create! name: 'Natural Athlete', country: countries(:norway) }

    it 'russian competitor in restricted event' do
      competitor = restricted_event.competitors.create! \
        profile: russian_person,
        suit: suits(:apache),
        section: restricted_event.sections.create!(name: 'Open')

      expect(competitor.country_code).to eq('RPF')
      expect(competitor.country_name).to eq('Neutral Athletes')
    end

    it 'norwegian competitor in restricted event' do
      competitor = restricted_event.competitors.create! \
        profile: norwegian_person,
        suit: suits(:apache),
        section: restricted_event.sections.create!(name: 'Open')

      expect(competitor.country_code).to eq('NOR')
      expect(competitor.country_name).to eq('Norway')
    end

    it 'russian competitor in non-restricted event' do
      competitor = not_restricted_event.competitors.create! \
        profile: russian_person,
        suit: suits(:apache),
        section: restricted_event.sections.create!(name: 'Open')

      expect(competitor.country_code).to eq('RUS')
      expect(competitor.country_name).to eq('Russia')
    end
  end
end
