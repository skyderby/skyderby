require 'test_helper'

class Api::V1::VirtualCompetitions::FavoritesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @competition = virtual_competitions(:distance_in_time) }

  test '#create adds the ranking to favorites' do
    assert_difference -> { users(:regular_user).virtual_competition_favorites.count }, 1 do
      post api_v1_virtual_competition_favorite_path(@competition), headers: bearer(:regular_user_write)
    end

    assert response.parsed_body['favorite']
  end

  test '#destroy removes the ranking from favorites' do
    @competition.favorite(user: users(:regular_user))

    delete api_v1_virtual_competition_favorite_path(@competition), headers: bearer(:regular_user_write)

    assert_not response.parsed_body['favorite']
    assert_not @competition.favorited?(users(:regular_user))
  end

  test 'rankings index reports favorites' do
    @competition.favorite(user: users(:regular_user))

    get api_v1_virtual_competitions_path(include_archived: true), headers: bearer(:regular_user_read)

    competitions = response.parsed_body['sections'].flat_map { it['groups'] }.flat_map { it['competitions'] }
    assert(competitions.find { it['id'] == @competition.id }['favorite'])
  end
end
