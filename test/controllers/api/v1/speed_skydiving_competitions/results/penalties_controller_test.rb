require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::Results::PenaltiesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @result = speed_skydiving_competition_results(:hinton_round_1)
  end

  test '#update adds, changes and removes penalties' do
    kept = @result.penalties.create!(percent: 10, reason: 'Exit')
    removed = @result.penalties.create!(percent: 20, reason: 'Late')
    get api_v1_speed_skydiving_competition_scoreboard_path(@event), headers: bearer(:event_responsible_write)
    etag = response.headers['ETag']

    patch api_v1_speed_skydiving_competition_result_penalties_path(@event, @result),
          params: { penalties: [
            { id: kept.id, percent: 15, reason: 'Exit' },
            { id: removed.id, _destroy: true },
            { percent: 5, reason: 'Window' }
          ] },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    penalties = response.parsed_body['penalties']
    assert_equal([[15, 'Exit'], [5, 'Window']], penalties.map { |penalty| penalty.values_at('percent', 'reason') })
    assert_equal kept.id, penalties.first['id']
    assert_not SpeedSkydivingCompetition::Result::Penalty.exists?(removed.id)

    get api_v1_speed_skydiving_competition_scoreboard_path(@event),
        headers: bearer(:event_responsible_write).merge('If-None-Match' => etag)
    assert_response :success
  end

  test '#update with an empty list keeps penalties' do
    @result.penalties.create!(percent: 10, reason: 'Exit')

    patch api_v1_speed_skydiving_competition_result_penalties_path(@event, @result),
          params: { penalties: [] }, headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_equal 1, @result.penalties.count
  end

  test '#update is forbidden for non-editors' do
    patch api_v1_speed_skydiving_competition_result_penalties_path(@event, @result),
          params: { penalties: [{ percent: 5, reason: 'Window' }] },
          headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
    assert_empty @result.penalties
  end
end
