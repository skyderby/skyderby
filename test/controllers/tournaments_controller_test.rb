require 'test_helper'

class TournamentsControllerTest < ActionDispatch::IntegrationTest
  test 'regular user #show redirects to qualification if no rounds' do
    tournament = tournaments(:qualification_loen)

    get tournament_path(tournament)

    assert_redirected_to tournament_qualification_path(tournament)
  end

  test 'organizer #show' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)

    get tournament_path(tournament)

    assert_response :success
  end
end
