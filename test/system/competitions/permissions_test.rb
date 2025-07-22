require 'application_system_test_case'

class PermissionsCompetitionsTest < ApplicationSystemTestCase
  test 'User can view published and finished competitions' do
    event = create :event
    event.public_event!
    event.published!

    visit performance_competition_path(event)
    assert_text event.name.upcase
  end

  test 'User can view competition if he compete in it' do
    event = create :event
    event.private_event!
    event.published!

    user = create :user
    create :event_competitor, event: event, profile: user.profile

    sign_in user
    visit performance_competition_path(event)

    assert_text event.name.upcase
  end

  test 'User can not view public draft competitions' do
    event = create :event
    event.public_event!
    event.draft!

    visit performance_competition_path(event)
    assert_text 'You are not authorized to access this page'
  end

  test 'User can not view private finished competitions' do
    event = create :event
    event.private_event!
    event.finished!

    visit performance_competition_path(event)
    assert_text 'You are not authorized to access this page'
  end
end
