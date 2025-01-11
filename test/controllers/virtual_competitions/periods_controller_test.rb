require 'test_helper'

class VirtualCompetitions::PeriodsControllerTest < ActionDispatch::IntegrationTest
  test 'redirects if competition is not using custom intervals' do
    online_competition = virtual_competitions(:base_race)
    online_competition.annual!

    get virtual_competition_period_path(virtual_competition_id: online_competition.id, id: '1st-week')

    assert_redirected_to virtual_competition_path(online_competition.id)
  end
end
