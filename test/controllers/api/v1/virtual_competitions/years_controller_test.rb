require 'test_helper'

class Api::V1::VirtualCompetitions::YearsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @competition = virtual_competitions(:skydive_distance_wingsuit)
  end

  test 'returns ranking for the year' do
    score(profiles(:john), 3000, Date.new(2024, 6, 1))
    score(profiles(:travis), 2500, Date.new(2023, 6, 1))

    get api_v1_virtual_competition_year_url(@competition, 2024)

    assert_response :success
    body = response.parsed_body
    assert_equal({ 'type' => 'year', 'year' => 2024 }, body['scope'])
    assert_equal([profiles(:john).id], body['scores'].map { |s| s['profile']['id'] })
  end

  test 'reports rank changes against last week in the current year' do
    travel_to Time.zone.local(2026, 6, 15, 12) do
      @competition.update!(period_to: Date.new(2026, 12, 31))
      score(profiles(:john), 3000, 2.weeks.ago)
      score(profiles(:travis), 3500, 1.day.ago)

      get api_v1_virtual_competition_year_url(@competition, 2026)
    end

    body = response.parsed_body
    assert body['showRankChanges']
    assert_equal [{ 'status' => 'new', 'delta' => nil }, { 'status' => 'down', 'delta' => -1 }],
                 body['scores'].pluck('rankChange')
  end

  test 'responds with not found for a year outside of the competition' do
    get api_v1_virtual_competition_year_url(@competition, 1999)

    assert_response :not_found
  end

  test 'responds with not found when competition uses custom intervals' do
    @competition.custom_intervals!

    get api_v1_virtual_competition_year_url(@competition, 2024)

    assert_response :not_found
  end

  private

  def score(profile, result, recorded_at)
    track = Track.create!(pilot: profile, kind: :skydive, visibility: :public_track,
                          suit: suits(:apache), recorded_at:)
    @competition.results.create!(track:, result:)
  end
end
