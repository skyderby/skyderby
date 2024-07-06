require 'application_system_test_case'

class EventsIndexPageTest < ApplicationSystemTestCase
  test 'index page shows all events' do
    visit '/events'

    assert_selector 'h1', text: 'Competitions'
    assert_selector 'div', text: 'WS Performance Nationals'
    assert_selector 'div', text: 'Russian Nationals'
    assert_selector 'div', text: 'WBR'

    fill_in 'searchTerm', with: 'Russian'
    assert_no_selector 'div', text: 'WS Performance Nationals'
    assert_no_selector 'div', text: 'WBR'
  end
end
