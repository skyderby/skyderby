require 'test_helper'

class Events::CompetitorRegistrationTest < ActiveSupport::TestCase
  setup do
    @event = events(:nationals)
    @section = event_sections(:advanced)
    @suit = suits(:apache)
  end

  test 'create competitor with existed profile' do
    profile = profiles(:john)

    params = {
      event_id: @event.id,
      section_id: @section.id,
      suit_id: @suit.id,
      profile_id: profile.id
    }

    assert_difference -> { @event.competitors.count } => 1 do
      Events::CompetitorRegistration.new(params).create
    end
  end

  test 'create competitor with new profile' do
    country = countries(:norway)
    name = 'Ivan'

    params = {
      event_id: @event.id,
      section_id: @section.id,
      suit_id: @suit.id,
      new_profile: 'true',
      name: name,
      country_id: country.id
    }

    assert_difference -> { @event.competitors.count } => 1 do
      Events::CompetitorRegistration.new(params).create
    end

    assert_equal name, @event.competitors.last.name
  end

  test 'update with existed profile' do
    competitor = event_competitors(:john)
    profile = profiles(:travis)

    params = {
      id: competitor.id,
      event_id: @event.id,
      section_id: @section.id,
      suit_id: @suit.id,
      profile_id: profile.id
    }

    Events::CompetitorRegistration.new(params).update

    assert_equal profile, @event.competitors.first.profile
  end

  test 'update with new profile' do
    competitor = event_competitors(:john)
    country = countries(:norway)
    name = 'Ivan'

    params = {
      id: competitor.id,
      event_id: @event.id,
      section_id: @section.id,
      suit_id: @suit.id,
      new_profile: 'true',
      name: name,
      country_id: country.id
    }

    Events::CompetitorRegistration.new(params).update

    assert_equal name, competitor.reload.name
  end
end
