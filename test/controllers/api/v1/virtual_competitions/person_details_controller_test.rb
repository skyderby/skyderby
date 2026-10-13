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

  test 'lists tracks of a multi-discipline ranking by total points with every discipline' do
    competition = virtual_competitions(:feather_challenge)
    best = Track.create!(pilot: profiles(:regular_user), kind: :base, visibility: :public_track,
                         suit: suits(:apache), recorded_at: Date.new(2025, 6, 1))
    other = Track.create!(pilot: profiles(:regular_user), kind: :base, visibility: :public_track,
                          suit: suits(:apache), recorded_at: Date.new(2025, 7, 1))
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track: best, result: 120)
    virtual_competition_disciplines(:feather_challenge_flare).results.create!(track: best, result: 15)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track: other, result: 60)

    get api_v1_virtual_competition_person_detail_url(competition, profiles(:regular_user)),
        headers: { 'Authorization' => 'Bearer regular-user-read-token' }

    assert_response :success
    results = response.parsed_body['results']
    assert_equal [best.id, other.id], results.pluck('track').pluck('id')
    assert_equal [200.0, 50.0], results.pluck('result')
    assert_equal([[120.0, 15.0], [60.0, nil]], results.pluck('disciplines').map { |entries| entries.pluck('result') })
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
