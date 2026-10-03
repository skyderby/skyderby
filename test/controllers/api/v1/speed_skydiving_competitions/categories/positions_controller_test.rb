require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::Categories::PositionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @female = speed_skydiving_competition_categories(:female)
  end

  test '#update moves a category up' do
    patch api_v1_speed_skydiving_competition_category_position_path(@event, @female),
          params: { direction: 'up' }, headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_equal %w[Female Male], @event.categories.ordered.map(&:name)
  end

  test '#update rejects an unknown direction' do
    patch api_v1_speed_skydiving_competition_category_position_path(@event, @female),
          params: { direction: 'sideways' }, headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
  end

  test '#update is forbidden for non-editors' do
    patch api_v1_speed_skydiving_competition_category_position_path(@event, @female),
          params: { direction: 'up' }, headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
