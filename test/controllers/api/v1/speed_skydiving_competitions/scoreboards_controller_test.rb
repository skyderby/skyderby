require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @result = speed_skydiving_competition_results(:hinton_round_1)
  end

  test '#show omits results of uncompleted rounds for viewers' do
    get api_v1_speed_skydiving_competition_scoreboard_path(@event)

    assert_response :success
    rows = response.parsed_body['groups'].flat_map { |group| group['rows'] }
    assert(rows.all? { |row| row['results'].empty? && row['total'].nil? })

    get api_v1_speed_skydiving_competition_scoreboard_path(@event), headers: bearer(:event_responsible_write)
    hinton = response.parsed_body['groups'].first['rows'].first
    assert_equal ['provisional'], hinton['results'].pluck('status')
  end

  test '#show totals completed rounds with penalties' do
    speed_skydiving_competition_rounds(:nationals_round_1).update_column(:completed_at, Time.zone.now)
    penalty = @result.penalties.create!(percent: 10, reason: 'Exit')

    get api_v1_speed_skydiving_competition_scoreboard_path(@event)

    body = response.parsed_body
    assert_equal(%w[Male Female], body['groups'].map { |group| group.dig('category', 'name') })
    hinton = body['groups'].first['rows'].sole
    assert_equal 1, hinton['rank']
    assert_in_delta 315.0, hinton['total']
    assert_equal '315.00', hinton['formattedTotal']
    result = hinton['results'].sole
    assert_equal 'final', result['status']
    assert_in_delta 350.0, result['result']
    assert_in_delta 315.0, result['finalResult']
    assert_equal [{ 'id' => penalty.id, 'percent' => 10, 'reason' => 'Exit' }], result['penalties']
    assert_equal tracks(:speed_skydiving_track).id, result['trackId']
  end

  test '#show hides standings of a surprise event' do
    @event.update_column(:status, :surprise)

    get api_v1_speed_skydiving_competition_scoreboard_path(@event)

    assert response.parsed_body['surprise']
    assert_empty response.parsed_body['groups']
  end

  test '#show returns not modified until results change' do
    get api_v1_speed_skydiving_competition_scoreboard_path(@event)
    etag = response.headers['ETag']

    get api_v1_speed_skydiving_competition_scoreboard_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :not_modified

    @result.penalties.create!(percent: 10, reason: 'Exit')
    get api_v1_speed_skydiving_competition_scoreboard_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :success
  end
end
