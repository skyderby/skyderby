require 'test_helper'

class Api::V1::AppleSessionsControllerTest < ActionDispatch::IntegrationTest
  include AppleIdentityTokenHelper

  setup { stub_apple_jwks }

  test 'signs in a user with a linked Apple identity' do
    user = users(:regular_user)
    user.identities.create!(provider: 'apple', uid: 'apple-1', email: user.email)

    assert_no_difference -> { User.count } do
      post api_v1_apple_session_path, params: { identity_token: apple_identity_token(sub: 'apple-1') }, as: :json
    end

    assert_response :ok
    body = response.parsed_body
    token = Doorkeeper::AccessToken.find_by!(token: body['access_token'])
    assert_equal user.id, token.resource_owner_id
    assert_equal oauth_applications(:skyderby_apple_native), token.application
    assert_equal 'read write', token.scopes.to_s
    assert_equal 1.day.to_i, body['expires_in']
    assert_equal 'Bearer', body['token_type']
    assert_predicate body['refresh_token'], :present?
    assert_equal 'read write', body['scope']
    assert_same false, body['created']
    assert_same false, body['private_email']
  end

  test 'links Apple to an existing user with the same real email' do
    user = users(:regular_user)

    assert_difference -> { user.identities.count } => 1 do
      post api_v1_apple_session_path, params: { identity_token: apple_identity_token(email: user.email) }, as: :json
    end

    assert_response :ok
    assert_same false, response.parsed_body['created']
  end

  test 'responds not found for an unknown private email' do
    assert_no_difference -> { User.count } do
      post api_v1_apple_session_path,
           params: { identity_token: apple_identity_token(email: 'x@privaterelay.appleid.com', private_email: true) },
           as: :json
    end

    assert_response :not_found
    assert_equal({ 'status' => 'not_found', 'private_email' => true }, response.parsed_body)
  end

  test 'responds not found for an unknown real email' do
    post api_v1_apple_session_path, params: { identity_token: apple_identity_token(email: 'new@example.com') },
                                    as: :json

    assert_response :not_found
    assert_equal({ 'status' => 'not_found', 'private_email' => false }, response.parsed_body)
  end

  test 'creates a confirmed user when asked' do
    assert_difference -> { User.count } => 1, -> { User::Identity.count } => 1 do
      post api_v1_apple_session_path,
           params: { identity_token: apple_identity_token(sub: 'apple-new', email: 'new@example.com'),
                     given_name: 'Ada', family_name: 'Lovelace', create: true },
           as: :json
    end

    assert_response :ok
    assert_same true, response.parsed_body['created']
    user = User.find_by!(email: 'new@example.com')
    assert_predicate user, :confirmed?
    assert_equal 'Ada Lovelace', user.name
    assert_equal 'apple-new', user.identities.sole.uid
    assert_not user.password_set?
  end

  test 'names the profile after the email or a default' do
    post api_v1_apple_session_path,
         params: { identity_token: apple_identity_token(sub: 'a1', email: 'skygod@example.com'), create: true },
         as: :json
    post api_v1_apple_session_path,
         params: { identity_token: apple_identity_token(sub: 'a2', email: 'zz9@privaterelay.appleid.com'),
                   create: 'true' },
         as: :json

    assert_equal 'skygod', User.find_by!(email: 'skygod@example.com').name
    assert_equal 'Skyderby pilot', User.find_by!(email: 'zz9@privaterelay.appleid.com').name
    assert_predicate User.find_by!(email: 'zz9@privaterelay.appleid.com').identities.sole, :private_email?
  end

  test 'stores the Apple refresh token from the authorization code' do
    received = []
    exchange = lambda do |code, client_id:|
      received << [code, client_id]
      'refresh-1'
    end

    User::Identity::AppleAuthorization.stub(:exchange, exchange) do
      post api_v1_apple_session_path,
           params: { identity_token: apple_identity_token(sub: 'a1', email: 'new@example.com'),
                     authorization_code: 'code-1', create: true },
           as: :json
    end

    assert_response :ok
    assert_equal [['code-1', 'io.skyderby.app']], received
    assert_equal 'refresh-1', User::Identity.find_by!(uid: 'a1').apple_refresh_token
  end

  test 'rejects an invalid token' do
    post api_v1_apple_session_path, params: { identity_token: 'garbage' }, as: :json

    assert_response :unauthorized
    assert_predicate response.parsed_body['errors'], :present?
  end

  test 'requires an identity token' do
    post api_v1_apple_session_path, params: {}, as: :json

    assert_response :bad_request
  end
end
