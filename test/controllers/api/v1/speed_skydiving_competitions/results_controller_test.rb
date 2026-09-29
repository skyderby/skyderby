require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::ResultsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @result = speed_skydiving_competition_results(:hinton_round_1)
  end

  test '#show is hidden until the round is completed' do
    get api_v1_speed_skydiving_competition_result_path(@event, @result)
    assert_response :not_found

    get api_v1_speed_skydiving_competition_result_path(@event, @result), headers: bearer(:event_responsible_write)
    assert_response :success
  end

  test '#show returns result details' do
    speed_skydiving_competition_rounds(:nationals_round_1).update_column(:completed_at, Time.zone.now)

    get api_v1_speed_skydiving_competition_result_path(@event, @result)

    assert_response :success
    body = response.parsed_body
    assert_equal 1, body['roundNumber']
    assert_in_delta 350.0, body['finalResult']
    assert_equal 'Nigel Hinton', body.dig('competitor', 'name')
    assert_equal 'Male', body.dig('category', 'name')
  end
end
