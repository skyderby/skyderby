require 'test_helper'

class Tracks::ReferencePointsControllerTest < ActionDispatch::IntegrationTest
  test '#show returns editable data for the pilot owner' do
    sign_in users(:regular_user)

    get track_reference_point_path(track_id: tracks(:hellesylt).id), as: :json

    assert_response :success
    assert response.parsed_body['editable']
  end

  test '#show is not editable for a different registered user' do
    sign_in users(:event_responsible)

    get track_reference_point_path(track_id: tracks(:hellesylt).id), as: :json

    assert_response :success
    assert_not response.parsed_body['editable']
  end
end
