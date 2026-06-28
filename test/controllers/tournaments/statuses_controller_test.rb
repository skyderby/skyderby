require 'test_helper'

module Tournaments
  class StatusesControllerTest < ActionDispatch::IntegrationTest
    test 'organizer updates the tournament status' do
      sign_in users(:regular_user)
      tournament = tournaments(:world_base_race)

      patch tournament_status_path(tournament), params: { tournament: { status: 'finished' } }

      assert_redirected_to tournament_path(tournament)
      assert_predicate tournament.reload, :finished?
    end

    test 'a non-organizer cannot update the status' do
      tournament = tournaments(:world_base_race)

      patch tournament_status_path(tournament), params: { tournament: { status: 'finished' } }

      assert_not_predicate tournament.reload, :finished?
    end
  end
end
