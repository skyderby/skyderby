require 'test_helper'

class Api::V1::PerformanceCompetitions::ResultsCopiesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @source = events(:nationals)
    @target = PerformanceCompetition.create!(
      name: 'Target', starts_at: Date.new(2016, 1, 1), responsible: users(:event_responsible), place: places(:ravenna),
      status: :published
    )
    @target.copy_competitors_from!(@source)
    event_results(:john_speed_1).update_column(:track_id, tracks(:hellesylt).id)
    event_results(:travis_speed_1).update_column(:track_id, tracks(:hellesylt).id)
  end

  test '#create copies rounds and results' do
    post api_v1_performance_competition_results_copy_path(@target),
         params: { source_event_id: @source.id },
         headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_equal 2, @target.rounds.count
    assert_equal 4, @target.results.count
  end

  test '#create refuses a source the user cannot view' do
    @source.update_column(:visibility, :private_event)
    @target.update!(responsible: users(:regular_user))

    post api_v1_performance_competition_results_copy_path(@target),
         params: { source_event_id: @source.id },
         headers: bearer(:regular_user_write)

    assert_response :not_found
    assert_equal 0, @target.rounds.count
  end
end
