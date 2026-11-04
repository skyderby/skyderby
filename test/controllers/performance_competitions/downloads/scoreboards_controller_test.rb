require 'test_helper'

class PerformanceCompetitions::Downloads::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @event = events(:nationals) }

  test 'organizers download the Excel sheet with an API token' do
    get performance_competition_downloads_scoreboard_path(@event, format: :xlsx),
        headers: bearer(:event_responsible_write)

    assert_response :success
    assert_includes response.headers['Content-Disposition'], '.xlsx'
  end

  test 'other users are refused' do
    get performance_competition_downloads_scoreboard_path(@event, format: :xlsx), headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test 'invalid tokens are refused' do
    get performance_competition_downloads_scoreboard_path(@event, format: :xlsx),
        headers: { 'Authorization' => 'Bearer nope' }

    assert_response :unauthorized
  end
end
