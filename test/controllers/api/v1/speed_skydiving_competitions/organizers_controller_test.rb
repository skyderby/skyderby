require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::OrganizersControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
  end

  test '#create and #destroy manage organizers' do
    post api_v1_speed_skydiving_competition_organizers_path(@event),
         params: { organizer: { user_id: users(:regular_user).id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    organizer_id = response.parsed_body['id']
    assert @event.reload.editable?(users(:regular_user))

    delete api_v1_speed_skydiving_competition_organizer_path(@event, organizer_id),
           headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_empty @event.organizers
  end

  test '#create is forbidden for non-editors' do
    post api_v1_speed_skydiving_competition_organizers_path(@event),
         params: { organizer: { user_id: users(:regular_user).id } },
         headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
