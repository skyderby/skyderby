require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test '#create- creates profile' do
    user = User.create!(
      email: 'example@example.com',
      password: 'changeme',
      password_confirmation: 'changeme',
      profile_attributes: { name: 'Testy McUserton' }
    )

    assert_predicate user.profile, :present?
    assert_equal 'Testy McUserton', user.profile.name
  end

  test '#responsible_of_events' do
    user = users(:regular_user)
    event = create :event, responsible: user

    assert_includes user.responsible_of_events, event
  end

  test '#organizer_of_event? - when responsible of event' do
    user = users(:regular_user)
    event = create :event, responsible: user

    assert user.organizer_of_event?(event)
  end

  test '#organizer_of_event? - when responsible of tournament' do
    user = users(:regular_user)
    tournament = tournaments(:world_base_race)

    assert user.organizer_of_event?(tournament)
  end
end
