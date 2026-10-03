require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::RoundsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @round = speed_skydiving_competition_rounds(:nationals_round_1)
  end

  test '#create adds the next round' do
    post api_v1_speed_skydiving_competition_rounds_path(@event), headers: bearer(:event_responsible_write)

    assert_response :created
    assert_equal 9, response.parsed_body['number']
  end

  test '#update completes a round and shows it on the scoreboard' do
    get api_v1_speed_skydiving_competition_scoreboard_path(@event)
    etag = response.headers['ETag']

    patch api_v1_speed_skydiving_competition_round_path(@event, @round),
          params: { round: { completed: true } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert response.parsed_body['completed']

    get api_v1_speed_skydiving_competition_scoreboard_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :success
    assert(response.parsed_body['rounds'].find { |round| round['id'] == @round.id }['completed'])
  end

  test '#destroy removes a round unless the event is finished' do
    last_round = speed_skydiving_competition_rounds(:nationals_round_8)
    delete api_v1_speed_skydiving_competition_round_path(@event, last_round), headers: bearer(:event_responsible_write)
    assert_response :no_content

    @event.update!(status: :finished)
    delete api_v1_speed_skydiving_competition_round_path(@event, @round), headers: bearer(:event_responsible_write)
    assert_response :unprocessable_content
  end

  test '#create is forbidden for non-editors' do
    post api_v1_speed_skydiving_competition_rounds_path(@event), headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
