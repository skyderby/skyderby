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

  test 'organizer updates the tournament status' do
    sign_in users(:regular_user)
    tournament = tournaments(:world_base_race)

    patch tournament_path(tournament), params: { tournament: { status: 'finished' } }

    assert_redirected_to tournament_path(tournament)
    assert_predicate tournament.reload, :finished?
  end
end
