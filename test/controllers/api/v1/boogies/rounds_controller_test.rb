require 'test_helper'

class Api::V1::Boogies::RoundsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
  end

  test '#create adds a distance round' do
    post api_v1_boogie_rounds_path(@boogie), headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    body = response.parsed_body
    assert_equal 'distance', body['discipline']
    assert_equal 3, body['number']
    assert_not body['completed']
  end

  test '#destroy removes an empty round' do
    round = @boogie.rounds.create!(discipline: :distance)

    delete api_v1_boogie_round_path(@boogie, round), headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not Boogie::Round.exists?(round.id)
  end

  test '#destroy refuses a round with results' do
    round = Boogie::Round.find(ActiveRecord::FixtureSet.identify(:boogie_distance_1))

    delete api_v1_boogie_round_path(@boogie, round), headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create is forbidden for non editors' do
    post api_v1_boogie_rounds_path(@boogie), headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
