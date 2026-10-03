require 'test_helper'

class Api::V1::PerformanceCompetitions::DeletionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#create deletes the event when the name matches' do
    post api_v1_performance_competition_deletion_path(@event),
         params: { event_deletion: { event_name: @event.name, delete_tracks: false } },
         headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not PerformanceCompetition.exists?(@event.id)
    assert Track.exists?(tracks(:hellesylt).id)
  end

  test '#create rejects a mismatching name' do
    post api_v1_performance_competition_deletion_path(@event),
         params: { event_deletion: { event_name: 'Wrong' } },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
    assert PerformanceCompetition.exists?(@event.id)
  end

  test '#create is forbidden for organizers who are not responsible' do
    @event.organizers.create!(user: users(:regular_user))

    post api_v1_performance_competition_deletion_path(@event),
         params: { event_deletion: { event_name: @event.name } },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
    assert PerformanceCompetition.exists?(@event.id)
  end
end
