require 'test_helper'

class Api::V1::PerformanceCompetitions::OrganizersControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#create and #destroy manage organizers' do
    post api_v1_performance_competition_organizers_path(@event),
         params: { organizer: { user_id: users(:regular_user).id } },
         headers: bearer(:event_responsible_write)

    assert_response :created
    organizer_id = response.parsed_body['id']
    assert_equal users(:regular_user).id, response.parsed_body['userId']

    delete api_v1_performance_competition_organizer_path(@event, organizer_id),
           headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_empty @event.organizers.reload
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_organizers_path(@event),
         params: { organizer: { user_id: users(:regular_user).id } },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
