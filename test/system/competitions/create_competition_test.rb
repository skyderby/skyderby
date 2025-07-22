require 'application_system_test_case'

class CreateCompetitionTest < ApplicationSystemTestCase
  test 'Registered user able to create new competition' do
    sign_in users(:regular_user)
    visit events_path

    click_link 'Competition'
    click_link 'Create Wingsuit Performance Competition'

    fill_in :performance_competition_name, with: 'Test event'
    fill_in :performance_competition_range_from, with: 3000
    fill_in :performance_competition_range_to, with: 2000
    hot_select places(:hellesylt_wbr).name, from: :place_id

    click_button 'Save'

    assert_selector('.show-page-title', text: 'TEST EVENT')
  end
end
