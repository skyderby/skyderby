require 'application_system_test_case'

class EditCompetitionTest < ApplicationSystemTestCase
  test 'updates event' do
    event = events(:nationals)
    event.update!(name: 'OLD NAME')
    new_event_name = 'NEW EVENT NAME'

    sign_in event.responsible
    visit "/events/performance/#{event.id}/edit"

    assert_selector 'h2', text: 'OLD NAME'

    fill_in 'name', with: new_event_name
    click_button I18n.t('general.save')

    assert_selector 'h2', text: new_event_name
  end

  test 'redirects to event on cancel' do
    event = events(:nationals)
    event.update!(name: 'EVENT NAME')

    sign_in event.responsible
    visit "/events/performance/#{event.id}/edit"
    click_link I18n.t('general.cancel')

    assert_current_path "/events/performance/#{event.id}"
    assert_selector 'h2', text: 'EVENT NAME'
  end

  test 'displays error when not allowed to access the page' do
    event = events(:nationals)

    visit "/events/performance/#{event.id}/edit"

    assert_text "You're not allowed to view this page."
  end
end
