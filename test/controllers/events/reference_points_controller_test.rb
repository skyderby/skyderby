require 'test_helper'

class Events::ReferencePointsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = performance_competitions(:nationals)
  end

  test 'regular user #show' do
    get event_reference_points_path(event_id: @event.id)
    assert_response :forbidden
  end

  test 'regular user #update' do
    put event_reference_points_path(event_id: @event.id, event: { designated_lane_start: 1 })
    assert_response :forbidden
  end

  test 'event organizer #show' do
    sign_in users(:event_responsible)
    get event_reference_points_path(event_id: @event.id)
    assert_response :success
  end

  test 'event organizer #update' do
    sign_in users(:event_responsible)
    put event_reference_points_path(event_id: @event.id, event: { designated_lane_start: 'on_10_sec' })
    assert_response :redirect
  end
end
