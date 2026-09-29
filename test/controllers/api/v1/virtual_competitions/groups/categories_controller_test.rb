require 'test_helper'

class Api::V1::VirtualCompetitions::Groups::CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @group = virtual_competition_groups(:cumulative)
    @competitions = {
      distance: virtual_competitions(:skydive_distance_wingsuit),
      speed: virtual_competitions(:skydive_speed_wingsuit),
      time: VirtualCompetition.create!(
        name: 'Wingsuit time', group: @group, suits_kind: :wingsuit, jumps_kind: :skydive,
        discipline: :time, period_from: Date.new(2015, 1, 1), period_to: Date.new(2025, 1, 1)
      )
    }
  end

  test 'returns only the rows of the requested page' do
    26.times do |index|
      score(Profile.create!(name: "Pilot #{index}"), distance: 3000 - (index * 50), speed: 300, time: 90)
    end

    get api_v1_virtual_competition_group_category_url(@group, 'wingsuit', page: 2)

    assert_response :success
    body = response.parsed_body
    assert_equal 2, body['page']
    assert_not body['hasMore']
    assert_nil body['nextPage']
    assert_equal [26], body['rows'].pluck('rank')
  end

  test 'responds with not found for a category without all disciplines' do
    get api_v1_virtual_competition_group_category_url(@group, 'slick')

    assert_response :not_found
  end

  private

  def score(profile, results)
    results.each do |discipline, result|
      track = Track.create!(pilot: profile, kind: :skydive, visibility: :public_track,
                            suit: suits(:apache), recorded_at: Date.new(2024, 6, 1))
      @competitions[discipline].results.create!(track:, result:)
    end
  end
end
