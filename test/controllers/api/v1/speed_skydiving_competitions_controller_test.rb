require 'test_helper'

class Api::Web::SpeedSkydivingCompetitionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = speed_skydiving_competitions(:nationals)
    @form_data = { name: 'Test event', starts_at: Time.zone.today, place_id: places(:ravenna).id }
  end

  test '#show - forbidden when user does not have access' do
    user = create(:user)
    sign_in user
    @event.draft!

    get api_v1_speed_skydiving_competition_url(@event)

    assert_response :forbidden
  end

  test 'forbidden for guest users / not logged in' do
    assert_no_changes -> { SpeedSkydivingCompetition.count } do
      post api_v1_speed_skydiving_competitions_url, params: { speed_skydiving_competition: @form_data }
    end

    assert_response :forbidden
  end

  test 'success when user is authorized' do
    user = users(:regular_user)
    sign_in user

    assert_difference -> { SpeedSkydivingCompetition.count } => 1 do
      post api_v1_speed_skydiving_competitions_url, params: { speed_skydiving_competition: @form_data }
    end

    assert_response :success
  end
end
