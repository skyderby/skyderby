require 'test_helper'

class Api::V1::PerformanceCompetitions::CompetitorsCopiesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @source = events(:nationals)
    @target = PerformanceCompetition.create!(
      name: 'Target', starts_at: Date.new(2016, 1, 1), responsible: users(:event_responsible), place: places(:ravenna),
      status: :published
    )
  end

  test '#create copies categories and competitors' do
    post api_v1_performance_competition_competitors_copy_path(@target),
         params: { source_event_id: @source.id },
         headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_equal 3, @target.competitors.count
    assert_equal %w[Advanced Intermediate], @target.categories.pluck(:name).sort
  end

  test '#create refuses a source the user cannot view' do
    @source.update_column(:status, :draft)
    @target.update!(responsible: users(:regular_user))

    post api_v1_performance_competition_competitors_copy_path(@target),
         params: { source_event_id: @source.id },
         headers: bearer(:regular_user_write)

    assert_response :not_found
    assert_equal 0, @target.competitors.count
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_competitors_copy_path(@target),
         params: { source_event_id: @source.id },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
