require 'test_helper'

class Api::V1::VirtualCompetitionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @competition = virtual_competitions(:skydive_distance_wingsuit)
    @competition.update!(period_to: 1.year.from_now.to_date)
  end

  test '#index lists active competitions grouped with athlete counts' do
    track = Track.create!(pilot: profiles(:john), kind: :skydive, visibility: :public_track,
                          suit: suits(:apache), recorded_at: 1.day.ago)
    @competition.results.create!(track:, result: 3000)

    get api_v1_virtual_competitions_url

    assert_response :success
    body = response.parsed_body
    assert_not body['includeArchived']
    assert_equal ['active'], body['sections'].pluck('key')

    group = body['sections'].first['groups'].find { |g| g['id'] == @competition.group_id }
    competition = group['competitions'].find { |c| c['id'] == @competition.id }
    assert_nil group['combined']
    assert_equal 1, competition['athleteCount']
    assert_equal 'distance', competition['discipline']
    assert_equal 'Worldwide', competition['location']
    assert_equal 'Cumulative - Wingsuit distance', competition['title']
  end

  test '#index exposes featured flags for competitions and groups' do
    @competition.update!(featured: true)
    @competition.group.update!(featured: true)

    get api_v1_virtual_competitions_url

    group = response.parsed_body['sections'].first['groups'].find { |g| g['id'] == @competition.group_id }
    assert group['featured']
    assert(group['competitions'].find { |c| c['id'] == @competition.id }['featured'])
  end

  test '#index includes archived section on request' do
    get api_v1_virtual_competitions_url(include_archived: 'true')

    body = response.parsed_body
    finished = body['sections'].find { |section| section['key'] == 'finished' }
    assert_equal 'Archived', finished['title']
    assert_includes finished['groups'].flat_map { |g| g['competitions'].pluck('id') },
                    virtual_competitions(:base_race).id
  end

  test '#show returns metadata, tabs and filters' do
    get api_v1_virtual_competition_url(@competition)

    assert_response :success
    competition = response.parsed_body['competition']
    assert_equal @competition.id, competition['id']
    assert_equal 'm', competition['unit']
    assert_equal 'annual', competition['intervalType']
    assert_nil competition['place']
    assert_empty competition['filters']['jumpKinds']
    assert_equal [nil, 'female'], competition['filters']['genders'].pluck('value')
    assert_equal({ 'type' => 'overall', 'label' => 'Overall',
                   'path' => api_v1_virtual_competition_overall_path(@competition) },
                 competition['tabs'].first)
    assert_equal (2015..Date.current.year).to_a, competition['tabs'].drop(1).pluck('year')
    assert_equal({ 'type' => 'year', 'year' => Date.current.year }, competition['defaultTab'])
    assert_empty competition['sponsors']
  end

  test '#show includes place for located competitions' do
    competition = virtual_competitions(:base_race)

    get api_v1_virtual_competition_url(competition)

    body = response.parsed_body['competition']
    assert_equal competition.place_id, body['place']['id']
    assert_equal 'ascending', body['resultsSortOrder']
    assert_equal({ 'type' => 'year', 'year' => 2020 }, body['defaultTab'])
  end

  test '#show responds with not found for unknown competition' do
    get api_v1_virtual_competition_url(id: 0)

    assert_response :not_found
    assert_equal({ 'errors' => ['Not found'] }, response.parsed_body)
  end
end
