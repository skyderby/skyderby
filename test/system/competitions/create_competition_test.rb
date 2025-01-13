require 'application_system_test_case'

class CreateCompetitionTest < ApplicationSystemTestCase
  test 'Registered user able to create new competition' do
    sign_in users(:regular_user)
    visit events_path

    click_link 'Competition'
    assert_selector('.modal-title', text: "#{I18n.t('activerecord.models.event')}: New")

    fill_in :event_name, with: 'Test event'
    fill_in :event_range_from, with: 3000
    fill_in :event_range_to, with: 2000
    select2 places(:hellesylt_wbr).name, from: 'event_place_id'

    find('input[type="submit"]').click

    assert_selector('.show-page-title', text: 'TEST EVENT')
  end
end
