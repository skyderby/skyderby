require 'test_helper'

class Api::V1::PerformanceCompetitions::ReferencePointsImportsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#create imports points and returns logs' do
    post api_v1_performance_competition_reference_points_import_path(@event),
         params: { file: fixture_file_upload('reference_points_valid.csv', 'text/csv') },
         headers: bearer(:event_responsible_write)

    assert_response :success
    assert_not_empty response.parsed_body['logs']
    assert_predicate @event.reference_points.count, :positive?
  end

  test '#create returns parse errors' do
    post api_v1_performance_competition_reference_points_import_path(@event),
         params: { file: fixture_file_upload('reference_points_invalid_coords.csv', 'text/csv') },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_reference_points_import_path(@event),
         params: { file: fixture_file_upload('reference_points_valid.csv', 'text/csv') },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
