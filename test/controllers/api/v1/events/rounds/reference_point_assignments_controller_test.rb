require 'test_helper'

class Api::V1::Events::Rounds::ReferencePointAssignmentsControllerTest < ActionDispatch::IntegrationTest
  test 'correct user assigns point' do
    sign_in users(:event_responsible)

    event = performance_competitions(:nationals)
    competitor = event_competitors(:john)
    round = event_rounds(:distance_1)
    reference_point = event.reference_points.create!(
      name: 'R1',
      latitude: 20,
      longitude: 20
    )

    params = {
      event_id: event.id,
      round_id: round.id,
      competitor_id: competitor.id,
      reference_point_id: reference_point.id
    }

    post api_v1_event_round_reference_point_assignments_path(event_id: event.id, round_id: round.id),
         params:, as: :json

    assert_response :success

    assignment = event.reference_point_assignments.find_by(competitor: competitor, round: round)
    assert_equal reference_point, assignment.reference_point
  end

  test 'correct user nullify assignment' do
    sign_in users(:event_responsible)

    event = performance_competitions(:nationals)
    competitor = event_competitors(:john)
    round = event_rounds(:distance_1)

    params = {
      event_id: event.id,
      round_id: round.id,
      competitor_id: competitor.id,
      reference_point_id: nil
    }

    post api_v1_event_round_reference_point_assignments_path(event_id: event.id, round_id: round.id),
         params:, as: :json

    assert_response :success

    assignment = event.reference_point_assignments.find_by(competitor: competitor, round: round)
    assert_nil assignment
  end

  test 'incorrect user nullify assignment' do
    event = performance_competitions(:nationals)
    competitor = event_competitors(:john)
    round = event_rounds(:distance_1)

    params = {
      event_id: event.id,
      round_id: round.id,
      competitor_id: competitor.id,
      reference_point_id: nil
    }

    post api_v1_event_round_reference_point_assignments_path(event_id: event.id, round_id: round.id),
         params:, as: :json

    assert_response :forbidden
  end
end
