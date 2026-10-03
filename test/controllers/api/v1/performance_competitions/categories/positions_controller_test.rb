require 'test_helper'

class Api::V1::PerformanceCompetitions::Categories::PositionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#update moves a category down' do
    patch api_v1_performance_competition_category_position_path(@event, event_sections(:advanced)),
          params: { direction: 'down' },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal 2, event_sections(:advanced).reload.order
    assert_equal 1, event_sections(:intermediate).reload.order
  end

  test '#update moves a category up' do
    patch api_v1_performance_competition_category_position_path(@event, event_sections(:intermediate)),
          params: { direction: 'up' },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal 1, event_sections(:intermediate).reload.order
  end

  test '#update rejects an unknown direction' do
    patch api_v1_performance_competition_category_position_path(@event, event_sections(:advanced)),
          params: { direction: 'sideways' },
          headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#update is forbidden for non editors' do
    patch api_v1_performance_competition_category_position_path(@event, event_sections(:advanced)),
          params: { direction: 'down' },
          headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
