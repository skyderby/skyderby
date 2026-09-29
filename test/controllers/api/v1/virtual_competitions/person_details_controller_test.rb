require 'test_helper'

class Api::V1::VirtualCompetitions::PersonDetailsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @competition = virtual_competitions(:skydive_distance_wingsuit)
    @profile = profiles(:john)
  end

  test 'returns best raw results and chronological chart' do
    older = score(3000, Date.new(2023, 6, 1))
    newer = score(3200, Date.new(2024, 6, 1))
    @competition.results.create!(track: older, result: 5000, wind_cancelled: true)

    get api_v1_virtual_competition_person_detail_url(@competition, @profile)

    assert_response :success
    body = response.parsed_body
    assert_equal @profile.id, body['profile']['id']
    assert_equal 'm', body['unit']
    assert_equal([newer.id, older.id], body['results'].map { |r| r['track']['id'] })
    assert_equal %w[3200 3000], body['results'].pluck('resultFormatted')
    assert_equal [3000.0, 3200.0], body['chart'].pluck('result')
    assert_equal '2023-06-01T00:00:00Z', body['chart'].first['recordedAt']
  end

  test 'responds with not found for unknown profile' do
    get api_v1_virtual_competition_person_detail_url(@competition, profile_id: 0)

    assert_response :not_found
  end

  private

  def score(result, recorded_at)
    track = Track.create!(pilot: @profile, kind: :skydive, visibility: :public_track,
                          suit: suits(:apache), recorded_at:)
    @competition.results.create!(track:, result:)
    track
  end
end
