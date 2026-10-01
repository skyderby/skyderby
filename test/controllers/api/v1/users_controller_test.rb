require 'test_helper'

class Api::V1::UsersControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#index finds pilots by profile name' do
    get api_v1_users_url(term: 'organ'), headers: bearer(:regular_user_read)

    assert_response :success
    found = response.parsed_body['items'].map { |item| item.slice('id', 'name') }
    assert_equal [{ 'id' => users(:event_responsible).id, 'name' => 'Organizer' }], found
  end

  test '#index needs at least two characters' do
    get api_v1_users_url(term: 'o'), headers: bearer(:regular_user_read)

    assert_response :success
    assert_empty response.parsed_body['items']
  end

  test '#index requires a signed in user' do
    get api_v1_users_url(term: 'organ')

    assert_response :unauthorized
  end
end
