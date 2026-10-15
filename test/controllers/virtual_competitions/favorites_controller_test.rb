require 'test_helper'

class VirtualCompetitions::FavoritesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @competition = virtual_competitions(:distance_in_time)
  end

  test '#create adds the ranking to favorites' do
    sign_in @user

    assert_difference -> { @user.virtual_competition_favorites.count }, 1 do
      post virtual_competition_favorite_path(@competition), as: :turbo_stream
    end

    assert_match 'icon--star-solid', @response.body
  end

  test '#destroy removes the ranking from favorites' do
    sign_in @user
    @competition.favorite(user: @user)

    assert_difference -> { @user.virtual_competition_favorites.count }, -1 do
      delete virtual_competition_favorite_path(@competition), as: :turbo_stream
    end
  end

  test '#create sends a guest to sign in' do
    post virtual_competition_favorite_path(@competition)

    assert_redirected_to new_user_session_path
  end
end
