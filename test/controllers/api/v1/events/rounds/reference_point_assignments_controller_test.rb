require 'test_helper'

class Api::V1::Events::Rounds::ReferencePointAssignmentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:nationals)
    @round = event_rounds(:distance_1)
    @competitor = event_competitors(:john)
    @user = users(:event_responsible)
    @user_without_permissions = users(:regular_user)
  end

  test '#create - correct user assigns point' do
    sign_in @user

    reference_point = @event.reference_points.create! name: 'R1', latitude: 20, longitude: 20

    params = { competitor_id: @competitor.id, reference_point_id: reference_point.id }

    post api_v1_event_round_reference_point_assignments_url(@event.id, @round.id), params: params

    assert_response :success

    assignment = @event.reference_point_assignments.find_by(competitor: @competitor, round: @round)

    assert_equal reference_point, assignment.reference_point
  end

  test '#create - correct user nullify assignment' do
    sign_in @user

    params = {
      competitor_id: @competitor.id,
      reference_point_id: nil
    }

    post api_v1_event_round_reference_point_assignments_url(@event.id, @round.id), params: params

    assert_response :success

    assignment = @event.reference_point_assignments.find_by(competitor: @competitor, round: @round)

    assert_nil assignment
  end

  test '#create - incorrect user nullify assignment' do
    sign_in @user_without_permissions
    params = { competitor_id: @competitor.id, reference_point_id: nil }

    post api_v1_event_round_reference_point_assignments_url(@event.id, @round.id), params: params

    assert_response :forbidden
  end
end
