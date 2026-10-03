require 'test_helper'

class Api::V1::PerformanceCompetitions::Results::JumpRangesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
    @round = @event.rounds.create!(discipline: :distance)
    @result = @round.results.create!(
      competitor: event_competitors(:alex),
      track_attributes: { file: fixture_file_upload('tracks/flysight.csv', 'text/csv') },
      uploaded_by: profiles(:event_responsible)
    )
  end

  test '#update changes the jump range and recalculates the result' do
    patch api_v1_performance_competition_result_jump_range_path(@event, @result),
          params: { jump_range: { ff_start: 10, ff_end: 40.0, landing_fl_time: nil } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    track = @result.track.reload
    assert_equal 10, track.ff_start
    assert_equal 40, track.ff_end
  end

  test '#update requires both bounds' do
    patch api_v1_performance_competition_result_jump_range_path(@event, @result),
          params: { jump_range: { ff_start: 10 } },
          headers: bearer(:event_responsible_write)

    assert_response :bad_request
  end

  test '#update is forbidden for non editors' do
    patch api_v1_performance_competition_result_jump_range_path(@event, @result),
          params: { jump_range: { ff_start: 10, ff_end: 40 } },
          headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
