require 'test_helper'

class Api::V1::VirtualCompetitions::OverallsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @competition = virtual_competitions(:skydive_distance_wingsuit)
  end

  test 'returns ranked scores with podium and pagination' do
    john_track = score(profiles(:john), 3000)
    score(profiles(:travis), 2500)
    score(profiles(:alex), 2000)

    get api_v1_virtual_competition_overall_url(@competition)

    assert_response :success
    body = response.parsed_body
    assert_equal({ 'type' => 'overall' }, body['scope'])
    assert_equal 'm', body['unit']
    assert_not body['showRankChanges']
    assert_equal({ 'page' => 1, 'perPage' => 25, 'totalPages' => 1, 'totalCount' => 3 }, body['pagination'])
    assert_equal [1, 2, 3], body['scores'].pluck('rank')
    assert_equal [1, 2, 3], body['podium'].pluck('rank')
    assert_nil body['focused']

    leader = body['scores'].first
    assert_in_delta 3000.0, leader['result']
    assert_equal '3000', leader['resultFormatted']
    assert_nil leader['rankChange']
    assert_equal profiles(:john).id, leader['profile']['id']
    assert_equal 'NOR', leader['profile']['countryCode']
    assert_equal '/images/thumb/missing.png', leader['profile']['photo']['thumb']
    assert_equal({ 'id' => suits(:apache).id, 'name' => 'Apache Series', 'kind' => 'wingsuit',
                   'manufacturer' => { 'id' => manufacturers(:tony).id, 'name' => 'Tony Suits', 'code' => 'TS' } },
                 leader['suit'])
    assert_equal john_track.id, leader['track']['id']
  end

  test 'filters by gender and re-ranks' do
    score(profiles(:john), 3000)
    female = Profile.create!(name: 'Female pilot', gender: :female)
    score(female, 2000)

    get api_v1_virtual_competition_overall_url(@competition, gender: 'female')

    body = response.parsed_body
    assert_equal 'female', body['filters']['gender']
    assert_equal([[1, female.id]], body['scores'].map { |s| [s['rank'], s['profile']['id']] })
    assert_empty body['podium']
  end

  test 'returns highlighted score separately when it is not on the current page' do
    26.times { |index| score(Profile.create!(name: "Pilot #{index}"), 3000 - index) }
    last = Profile.find_by(name: 'Pilot 25')

    get api_v1_virtual_competition_overall_url(@competition, highlight: last.id, page: 1)

    body = response.parsed_body
    assert_equal 2, body['pagination']['totalPages']
    assert_equal 26, body['focused']['rank']
    assert body['focused']['focused']
  end

  test 'opens the page with the highlighted profile' do
    26.times { |index| score(Profile.create!(name: "Pilot #{index}"), 3000 - index) }
    last = Profile.find_by(name: 'Pilot 25')

    get api_v1_virtual_competition_overall_url(@competition, highlight: last.id)

    body = response.parsed_body
    assert_equal 2, body['pagination']['page']
    assert_nil body['focused']
    assert body['scores'].first['focused']
  end

  private

  def score(profile, result)
    track = Track.create!(pilot: profile, kind: :skydive, visibility: :public_track,
                          suit: suits(:apache), recorded_at: Date.new(2024, 6, 1))
    @competition.results.create!(track:, result:)
    track
  end
end
