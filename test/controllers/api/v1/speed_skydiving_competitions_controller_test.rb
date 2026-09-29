require 'test_helper'

class Api::V1::SpeedSkydivingCompetitionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
  end

  test '#show returns event details' do
    get api_v1_speed_skydiving_competition_path(@event)

    assert_response :success
    body = response.parsed_body
    assert_equal 'speed_skydiving_competition', body['type']
    assert_equal %w[Male Female], body['categories'].pluck('name')
    assert_equal (1..8).to_a, body['rounds'].pluck('number')
    assert_equal %w[scoreboard open], body['boards'].pluck('key')
    hinton = body['competitors'].find { |competitor| competitor['name'] == 'Nigel Hinton' }
    assert_equal '1', hinton['assignedNumber']
    assert_nil hinton['suit']
  end

  test '#show hides drafts from guests' do
    @event.update_column(:status, :draft)

    get api_v1_speed_skydiving_competition_path(@event)
    assert_response :not_found

    get api_v1_speed_skydiving_competition_path(@event), headers: bearer(:event_responsible_write)
    assert_response :success
  end
end
