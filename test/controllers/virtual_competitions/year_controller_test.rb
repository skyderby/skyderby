require 'test_helper'

class VirtualCompetitions::YearControllerTest < ActionDispatch::IntegrationTest
  test 'redirects if competition is not annual' do
    online_competition = virtual_competitions(:base_race)
    online_competition.custom_intervals!

    get virtual_competition_year_path(virtual_competition_id: online_competition.id, year: 2020)

    assert_redirected_to virtual_competition_path(online_competition.id)
  end
end
