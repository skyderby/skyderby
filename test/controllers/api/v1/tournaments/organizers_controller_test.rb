require 'test_helper'

class Api::V1::Tournaments::OrganizersControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @tournament = tournaments(:world_base_race) }

  test '#create adds an organizer who can then edit the tournament' do
    post api_v1_tournament_organizers_path(@tournament),
         params: { organizer: { user_id: users(:event_responsible).id } },
         headers: bearer(:regular_user_write), as: :json

    assert_response :created
    assert_equal users(:event_responsible).id, response.parsed_body['userId']
    assert @tournament.editable?(users(:event_responsible))
  end

  test '#destroy removes an organizer' do
    organizer = @tournament.organizers.create!(user: users(:event_responsible))

    delete api_v1_tournament_organizer_path(@tournament, organizer), headers: bearer(:regular_user_write)

    assert_response :no_content
    assert_not Organizer.exists?(organizer.id)
  end

  test '#create is forbidden for non organizers' do
    post api_v1_tournament_organizers_path(@tournament),
         params: { organizer: { user_id: users(:event_responsible).id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
  end
end
