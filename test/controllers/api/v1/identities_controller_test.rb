require 'test_helper'

class Api::V1::IdentitiesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper
  include AppleIdentityTokenHelper

  setup { @user = users(:regular_user) }

  test '#index lists identities' do
    identity = @user.identities.create!(provider: 'apple', uid: 'a1', email: 'x@privaterelay.appleid.com')

    get api_v1_identities_path, headers: bearer(:regular_user_read), as: :json

    assert_response :ok
    item = response.parsed_body['items'].sole
    assert_equal identity.id, item['id']
    assert_equal 'apple', item['provider']
    assert_equal 'x@privaterelay.appleid.com', item['email']
    assert_same true, item['privateEmail']
    assert item.key?('createdAt')
  end

  test '#index requires authentication' do
    get api_v1_identities_path, as: :json

    assert_response :unauthorized
  end

  test '#create links Apple' do
    stub_apple_jwks

    assert_difference -> { @user.identities.count } => 1 do
      post api_v1_identities_path,
           params: { provider: 'apple', identity_token: apple_identity_token(sub: 'a1', email: 'x@example.com') },
           headers: bearer(:regular_user_write), as: :json
    end

    assert_response :created
    assert_equal 'apple', response.parsed_body['provider']
    assert_equal 'x@example.com', response.parsed_body['email']
  end

  test '#create refuses an Apple id linked to another user' do
    stub_apple_jwks
    users(:admin).identities.create!(provider: 'apple', uid: 'a1')

    assert_no_difference -> { User::Identity.count } do
      post api_v1_identities_path, params: { provider: 'apple', identity_token: apple_identity_token(sub: 'a1') },
                                   headers: bearer(:regular_user_write), as: :json
    end

    assert_response :unprocessable_content
    assert_equal ['This Apple ID is already linked to another Skyderby account.'], response.parsed_body['errors']
  end

  test '#create rejects an expired token' do
    stub_apple_jwks

    post api_v1_identities_path,
         params: { provider: 'apple', identity_token: apple_identity_token(exp: 1.minute.ago.to_i) },
         headers: bearer(:regular_user_write), as: :json

    assert_response :unauthorized
  end

  test '#create requires write scope' do
    post api_v1_identities_path, params: { provider: 'apple', identity_token: 'x' },
                                 headers: bearer(:regular_user_read), as: :json

    assert_response :forbidden
  end

  test '#destroy removes an identity' do
    @user.update_column(:password_set, true)
    identity = @user.identities.create!(provider: 'apple', uid: 'a1')

    delete api_v1_identity_path(identity), headers: bearer(:regular_user_write), as: :json

    assert_response :no_content
    assert_not User::Identity.exists?(identity.id)
  end

  test '#destroy refuses the only identity of a user without password' do
    @user.update_column(:password_set, false)
    identity = @user.identities.create!(provider: 'apple', uid: 'a1')

    delete api_v1_identity_path(identity), headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
    assert User::Identity.exists?(identity.id)
  end

  test '#destroy cannot touch identities of other users' do
    identity = users(:admin).identities.create!(provider: 'apple', uid: 'a1')

    delete api_v1_identity_path(identity), headers: bearer(:regular_user_write), as: :json

    assert_response :not_found
  end

  test 'is forbidden while impersonating' do
    impersonation = Impersonation.start!(admin: users(:admin), user: @user,
                                         application: oauth_applications(:skyderby_apple))

    get api_v1_identities_path, headers: { 'Authorization' => "Bearer #{impersonation.access_token.token}" },
                                as: :json

    assert_response :forbidden
  end
end
