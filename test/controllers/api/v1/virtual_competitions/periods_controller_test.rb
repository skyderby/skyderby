require 'test_helper'

class Api::V1::VirtualCompetitions::PeriodsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @competition = virtual_competitions(:skydive_distance_wingsuit)
    @competition.custom_intervals!
    @interval = @competition.custom_intervals.create!(
      name: 'Round 1', period_from: Time.zone.local(2024, 1, 1), period_to: Time.zone.local(2024, 12, 31)
    )
  end

  test 'returns ranking for the interval' do
    score(profiles(:john), 3000, Date.new(2024, 6, 1))
    score(profiles(:travis), 3500, Date.new(2023, 6, 1))

    get api_v1_virtual_competition_period_url(@competition, 'round-1')

    assert_response :success
    body = response.parsed_body
    assert_equal 'period', body['scope']['type']
    assert_equal 'round-1', body['scope']['slug']
    assert_equal 'Round 1', body['scope']['name']
    assert_equal([profiles(:john).id], body['scores'].map { |s| s['profile']['id'] })
  end

  test 'lists interval tabs on the competition' do
    get api_v1_virtual_competition_url(@competition)

    competition = response.parsed_body['competition']
    assert_equal %w[overall period], competition['tabs'].pluck('type')
    assert_equal({ 'type' => 'period', 'slug' => 'round-1' }, competition['defaultTab'])
  end

  test 'responds with not found for unknown interval' do
    get api_v1_virtual_competition_period_url(@competition, 'unknown')

    assert_response :not_found
  end

  test 'responds with not found when competition is annual' do
    @competition.annual!

    get api_v1_virtual_competition_period_url(@competition, 'round-1')

    assert_response :not_found
  end

  private

  def score(profile, result, recorded_at)
    track = Track.create!(pilot: profile, kind: :skydive, visibility: :public_track,
                          suit: suits(:apache), recorded_at:)
    @competition.results.create!(track:, result:)
  end
end
