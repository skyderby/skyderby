require 'test_helper'

class PerformanceCompetition::CompetitorTest < ActiveSupport::TestCase
  test 'a profile created by name through the event belongs to the event' do
    event = events(:nationals)
    competitor = event.competitors.new(
      category: event_sections(:advanced),
      suit: suits(:apache),
      profile_attributes: { name: 'Brand New Pilot', country_id: countries(:norway).id }
    )

    assert competitor.save
    assert_equal event, competitor.profile.reload.owner
  end
end
