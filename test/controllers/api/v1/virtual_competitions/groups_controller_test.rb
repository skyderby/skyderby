require 'test_helper'

class Api::V1::VirtualCompetitions::GroupsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @group = virtual_competition_groups(:cumulative)
    @distance = virtual_competitions(:skydive_distance_wingsuit)
    @speed = virtual_competitions(:skydive_speed_wingsuit)
    @time = VirtualCompetition.create!(
      name: 'Wingsuit time', group: @group, suits_kind: :wingsuit, jumps_kind: :skydive,
      discipline: :time, period_from: Date.new(2015, 1, 1), period_to: Date.new(2025, 1, 1)
    )
  end

  test 'returns combined standings per suit category' do
    score(profiles(:john), distance: 3000, speed: 300, time: 90)
    score(profiles(:travis), distance: 1500, speed: 150, time: 45)

    get api_v1_virtual_competition_group_url(@group)

    assert_response :success
    body = response.parsed_body
    assert_equal @group.name, body['group']['name']
    assert_equal %w[distance speed time], body['disciplines'].pluck('key')
    assert_equal [false, true], body['filters']['winds'].pluck('value')
    assert_nil body['emptyMessage']

    category = body['categories'].sole
    assert_equal 'wingsuit', category['suitKind']
    assert_equal({ 'distance' => @distance.id, 'speed' => @speed.id, 'time' => @time.id }, category['competitions'])
    assert_equal [1, 2], category['rows'].pluck('rank')

    leader, runner_up = category['rows']
    assert_in_delta 300.0, leader['totalPoints']
    assert leader['disciplines']['distance']['best']
    assert_equal '-1500', runner_up['disciplines']['distance']['gapFormatted']
    assert_in_delta 50.0, runner_up['disciplines']['distance']['points']
  end

  test 'treats wind=false as raw results' do
    score(profiles(:john), distance: 3000, speed: 300, time: 90)

    get api_v1_virtual_competition_group_url(@group, wind: 'false')

    assert_not response.parsed_body['filters']['wind']
    assert_equal 1, response.parsed_body['categories'].sole['rows'].size
  end

  test 'returns an empty message when no suit class has all disciplines' do
    get api_v1_virtual_competition_group_url(virtual_competition_groups(:main))

    body = response.parsed_body
    assert_empty body['categories']
    assert_equal 'No suit class in this group has all three disciplines yet.', body['emptyMessage']
  end

  test 'responds with not found for unknown group' do
    get api_v1_virtual_competition_group_url(id: 0)

    assert_response :not_found
  end

  private

  def score(profile, results)
    results.each do |discipline, result|
      track = Track.create!(pilot: profile, kind: :skydive, visibility: :public_track,
                            suit: suits(:apache), recorded_at: Date.new(2024, 6, 1))
      instance_variable_get(:"@#{discipline}").results.create!(track:, result:)
    end
  end
end
