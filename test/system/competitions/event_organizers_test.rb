require 'application_system_test_case'

class EventOrganizersTest < ApplicationSystemTestCase
  test 'add organizer' do
    event = events(:nationals)
    organizer = users(:regular_user)

    sign_in users(:event_responsible)
    visit event_path(event)

    click_link I18n.t('organizers.list.add_judge')
    assert_selector('.modal-title', text: "#{I18n.t('activerecord.models.organizer')}: New")

    select2 organizer.name, from: 'organizer_user_id'

    click_button I18n.t('general.save')
    assert_no_selector('.modal-title', text: "#{I18n.t('activerecord.models.organizer')}: New")

    assert_text organizer.name
  end
end
