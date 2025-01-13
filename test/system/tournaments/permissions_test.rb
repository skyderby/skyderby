require 'application_system_test_case'

class TournamentsPermissionsTest < ApplicationSystemTestCase
  test 'Not logged in user can not access new action' do
    visit new_tournament_path

    assert_text 'You are not authorized to access this page.'
  end

  test 'Not logged in user can not access edit action' do
    tournament = tournaments(:world_base_race)
    visit edit_tournament_path(tournament)

    assert_text 'You are not authorized to access this page.'
  end
end
