require 'test_helper'

class Api::V1::Boogies::OrganizersControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
  end

  test '#create adds an organizer' do
    post api_v1_boogie_organizers_path(@boogie), params: { organizer: { user_id: users(:regular_user).id } },
                                                 headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    assert_equal users(:regular_user).id, response.parsed_body['userId']
    assert @boogie.organizers.exists?(user: users(:regular_user))
  end

  test '#destroy removes an organizer' do
    organizer = @boogie.organizers.create!(user: users(:regular_user))

    delete api_v1_boogie_organizer_path(@boogie, organizer), headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not Organizer.exists?(organizer.id)
  end

  test '#create is forbidden for non editors' do
    post api_v1_boogie_organizers_path(@boogie), params: { organizer: { user_id: users(:regular_user).id } },
                                                 headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
