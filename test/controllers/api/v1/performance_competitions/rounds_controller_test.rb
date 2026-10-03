require 'test_helper'

class Api::V1::PerformanceCompetitions::RoundsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#create adds a round' do
    post api_v1_performance_competition_rounds_path(@event),
         params: { round: { discipline: 'time' } },
         headers: bearer(:event_responsible_write)

    assert_response :created
    body = response.parsed_body
    assert_equal 'time', body['discipline']
    assert_equal 1, body['number']
    assert_not body['completed']
  end

  test '#create rejects an unknown discipline' do
    post api_v1_performance_competition_rounds_path(@event),
         params: { round: { discipline: 'bogus' } },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_rounds_path(@event),
         params: { round: { discipline: 'time' } },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end

  test '#update reopens a round' do
    patch api_v1_performance_competition_round_path(@event, event_rounds(:distance_1)),
          params: { round: { completed: false } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_not response.parsed_body['completed']
    assert_nil event_rounds(:distance_1).reload.completed_at
  end

  test '#destroy removes an empty round' do
    round = @event.rounds.create!(discipline: :time)

    delete api_v1_performance_competition_round_path(@event, round), headers: bearer(:event_responsible_write)

    assert_response :no_content
  end

  test '#destroy refuses a round with results' do
    delete api_v1_performance_competition_round_path(@event, event_rounds(:distance_1)),
           headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end
end
