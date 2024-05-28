require 'test_helper'

class SpeedSkydivingCompetition::CompetitorTest < ActiveSupport::TestCase
  setup do
    @restricted_event = SpeedSkydivingCompetition.create!(
      name: 'Restricted Event',
      place: places(:ravenna),
      starts_at: '2021-09-01',
      is_official: true,
      responsible: users(:event_responsible)
    )

    @not_restricted_event = SpeedSkydivingCompetition.create!(
      starts_at: '2021-09-01',
      place: places(:ravenna),
      name: 'Not-Restricted Event',
      is_official: false,
      responsible: users(:event_responsible)
    )

    @russian_person = Profile.create!(name: 'Natural Athlete', country: countries(:russia))
    @norwegian_person = Profile.create!(name: 'Natural Athlete', country: countries(:norway))
  end

  test 'russian competitor in restricted event' do
    competitor = @restricted_event.competitors.create!(
      profile: @russian_person,
      category: @restricted_event.categories.create!(name: 'Open')
    )

    assert_equal 'RPF', competitor.country_code
    assert_equal 'Neutral Athletes', competitor.country_name
  end

  test 'norwegian competitor in restricted event' do
    competitor = @restricted_event.competitors.create!(
      profile: @norwegian_person,
      category: @restricted_event.categories.create!(name: 'Open')
    )

    assert_equal 'NOR', competitor.country_code
    assert_equal 'Norway', competitor.country_name
  end

  test 'russian competitor in non-restricted event' do
    competitor = @not_restricted_event.competitors.create!(
      profile: @russian_person,
      category: @not_restricted_event.categories.create!(name: 'Open')
    )

    assert_equal 'RUS', competitor.country_code
    assert_equal 'Russia', competitor.country_name
  end
end
