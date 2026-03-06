require 'application_system_test_case'

class EventOrganizersTest < ApplicationSystemTestCase
  test 'add organizer' do
    event = events(:nationals)
    organizer = users(:regular_user)

    sign_in users(:event_responsible)
    visit performance_competition_path(event)

    click_button I18n.t('organizers.list.add_judge')
    assert_selector('.dialog-title', text: I18n.t('activerecord.models.organizer').to_s)

    hot_select organizer.name, from: :user_id

    click_button I18n.t('general.save')
    assert_no_selector('.dialog-title', text: I18n.t('activerecord.models.organizer').to_s)

    assert_text organizer.name
  end
end
