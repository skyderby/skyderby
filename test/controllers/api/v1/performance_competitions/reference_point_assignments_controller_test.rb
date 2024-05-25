require 'test_helper'

class Api::V1::PerformanceCompetitions::ReferencePointAssignmentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:published_public)
    @event_responsible = users(:event_responsible)
    @random_user = User.create!(email: 'some@example.com', password: '123456', confirmed_at: Time.zone.today)
    @competitor = event_competitors(:competitor_1)
    @round = event_rounds(:distance_round_1)
  end

  test '#create - assign reference point' do
    sign_in @event_responsible

    reference_point = @event.reference_points.create! \
      name: 'R1',
      latitude: 20,
      longitude: 20

    params = {
      reference_point_assignment: {
        round_id: @round.id,
        competitor_id: @competitor.id,
        reference_point_id: reference_point.id
      }
    }

    post api_v1_performance_competition_reference_point_assignments_path(@event), params: params

    assert_response :success

    assignment = @event.reference_point_assignments.find_by(competitor: @competitor, round: @round)
    assert_equal reference_point, assignment.reference_point
  end

  test '#create - remove assignment' do
    sign_in @event_responsible

    reference_point = @event.reference_points.create! \
      name: 'R1',
      latitude: 20,
      longitude: 20
    assignment = @event.reference_point_assignments.find_or_initialize_by(competitor: @competitor, round: @round)
    assignment.update!(reference_point: reference_point)

    params = {
      reference_point_assignment: {
        round_id: @round.id,
        competitor_id: @competitor.id,
        reference_point_id: nil
      }
    }

    post api_v1_performance_competition_reference_point_assignments_path(@event), params: params

    assert_response :success
    assert_nil @event.reference_point_assignments.find_by(competitor: @competitor, round: @round)
  end

  test '#create - verifies permissions' do
    sign_in @random_user

    params = {
      reference_point_assignment: {
        round_id: @round.id,
        competitor_id: @competitor.id,
        reference_point_id: nil
      }
    }

    post api_v1_performance_competition_reference_point_assignments_path(@event), params: params

    assert_response :forbidden
    assert_equal({ 'errors' => { 'base' => ['forbidden'] } }, response.parsed_body)
  end
end
