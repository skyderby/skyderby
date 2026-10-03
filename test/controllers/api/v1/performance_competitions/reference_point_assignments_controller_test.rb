require 'test_helper'

class Api::V1::PerformanceCompetitions::ReferencePointAssignmentsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
    @round = event_rounds(:distance_1)
    @competitor = event_competitors(:john)
    @point = @event.reference_points.create!(name: 'R1', latitude: 1, longitude: 2)
  end

  test '#create assigns and removes a point' do
    post api_v1_performance_competition_reference_point_assignments_path(@event),
         params: { round_id: @round.id, competitor_id: @competitor.id, reference_point_id: @point.id },
         headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal @point.id, response.parsed_body['referencePointId']
    assert_equal @point, @round.reference_point_assignments.find_by(competitor: @competitor).reference_point

    post api_v1_performance_competition_reference_point_assignments_path(@event),
         params: { round_id: @round.id, competitor_id: @competitor.id, reference_point_id: '' },
         headers: bearer(:event_responsible_write)

    assert_response :success
    assert_nil response.parsed_body['referencePointId']
    assert_nil @round.reference_point_assignments.find_by(competitor: @competitor)
  end

  test '#create removing a missing assignment is a no-op' do
    post api_v1_performance_competition_reference_point_assignments_path(@event),
         params: { round_id: @round.id, competitor_id: @competitor.id },
         headers: bearer(:event_responsible_write)

    assert_response :success
  end

  test '#create refuses a point of another event' do
    other = PerformanceCompetition.create!(
      name: 'Other', starts_at: Date.new(2016, 1, 1), responsible: users(:event_responsible)
    )
    foreign = other.reference_points.create!(name: 'X', latitude: 1, longitude: 2)

    post api_v1_performance_competition_reference_point_assignments_path(@event),
         params: { round_id: @round.id, competitor_id: @competitor.id, reference_point_id: foreign.id },
         headers: bearer(:event_responsible_write)

    assert_response :not_found
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_reference_point_assignments_path(@event),
         params: { round_id: @round.id, competitor_id: @competitor.id, reference_point_id: @point.id },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
