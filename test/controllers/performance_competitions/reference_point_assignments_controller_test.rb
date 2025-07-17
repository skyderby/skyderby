require 'test_helper'

class PerformanceCompetitions::ReferencePointAssignmentsControllerTest < ActionDispatch::IntegrationTest
  test 'correct user assigns point' do
    sign_in users(:event_responsible)

    event = events(:nationals)
    competitor = event_competitors(:john)
    round = event_rounds(:distance_1)
    reference_point = event.reference_points.create!(
      name: 'R1',
      latitude: 20,
      longitude: 20
    )

    params = {
      round_id: round.id,
      competitor_id: competitor.id,
      reference_point_id: reference_point.id
    }

    post event_reference_point_assignments_path(event_id: event.id), params: params

    assert_response :success

    assignment = round.reference_point_assignments.find_by(competitor: competitor)
    assert_equal reference_point, assignment.reference_point
  end

  test 'correct user nullify assignment' do
    sign_in users(:event_responsible)

    event = events(:nationals)
    competitor = event_competitors(:john)
    round = event_rounds(:distance_1)
    reference_point = event.reference_points.create!(
      name: 'R1',
      latitude: 20,
      longitude: 20
    )

    round.reference_point_assignments.create!(competitor:, reference_point:)

    params = {
      round_id: round.id,
      competitor_id: competitor.id,
      reference_point_id: nil
    }

    post event_reference_point_assignments_path(event_id: event.id), params: params

    assert_response :success

    assignment = round.reference_point_assignments.find_by(competitor: competitor)
    assert_nil assignment
  end

  test 'incorrect user cannot assign point' do
    event = events(:nationals)
    competitor = event_competitors(:john)
    round = event_rounds(:distance_1)
    reference_point = event.reference_points.create!(
      name: 'R1',
      latitude: 20,
      longitude: 20
    )

    params = {
      round_id: round.id,
      competitor_id: competitor.id,
      reference_point_id: reference_point.id
    }

    post event_reference_point_assignments_path(event_id: event.id), params: params

    assert_response :forbidden
  end

  test 'raises error if round not found' do
    sign_in users(:event_responsible)

    event = events(:nationals)
    competitor = event_competitors(:john)
    reference_point = event.reference_points.create!(
      name: 'R1',
      latitude: 20,
      longitude: 20
    )

    params = {
      round_id: 999999,
      competitor_id: competitor.id,
      reference_point_id: reference_point.id
    }

    assert_raises(ActiveRecord::RecordNotFound) do
      post event_reference_point_assignments_path(event_id: event.id), params: params
    end
  end

  test 'raises error if competitor not found' do
    sign_in users(:event_responsible)

    event = events(:nationals)
    round = event_rounds(:distance_1)
    reference_point = event.reference_points.create!(
      name: 'R1',
      latitude: 20,
      longitude: 20
    )

    params = {
      round_id: round.id,
      competitor_id: 999999,
      reference_point_id: reference_point.id
    }

    assert_raises(ActiveRecord::RecordNotFound) do
      post event_reference_point_assignments_path(event_id: event.id), params: params
    end
  end

  test 'raises error if reference point not found' do
    sign_in users(:event_responsible)

    event = events(:nationals)
    competitor = event_competitors(:john)
    round = event_rounds(:distance_1)

    params = {
      round_id: round.id,
      competitor_id: competitor.id,
      reference_point_id: 999999
    }

    assert_raises(ActiveRecord::RecordNotFound) do
      post event_reference_point_assignments_path(event_id: event.id), params: params
    end
  end
end
