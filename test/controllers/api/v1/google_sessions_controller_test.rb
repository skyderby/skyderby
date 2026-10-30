require 'test_helper'

class Api::V1::GoogleSessionsControllerTest < ActionDispatch::IntegrationTest
  include GoogleIdTokenHelper

  setup { stub_google_jwks }

  test 'signs in a user with a linked Google identity' do
    user = users(:regular_user)
    user.identities.create!(provider: 'google_oauth2', uid: 'google-1', email: user.email)

    assert_no_difference -> { User.count } do
      post_session(id_token: google_id_token(sub: 'google-1'))
    end

    assert_response :ok
    body = response.parsed_body
    token = Doorkeeper::AccessToken.find_by!(token: body['access_token'])
    assert_equal user.id, token.resource_owner_id
    assert_equal oauth_applications(:skyderby_android_native), token.application
    assert_equal 'read write', token.scopes.to_s
    assert_predicate body['refresh_token'], :present?
    assert_equal 'Bearer', body['token_type']
    assert_same false, body['created']
    assert_same false, body['private_email']
  end

  test 'links Google to an existing user with the same verified email' do
    user = users(:regular_user)

    assert_difference -> { user.identities.where(provider: 'google_oauth2').count } => 1 do
      post_session(id_token: google_id_token(email: user.email))
    end

    assert_response :ok
    assert_same false, response.parsed_body['created']
  end

  test 'does not match an existing user by an unverified email' do
    post_session(id_token: google_id_token(email: users(:regular_user).email, email_verified: false))

    assert_response :not_found
    assert_equal({ 'status' => 'not_found', 'private_email' => false }, response.parsed_body)
  end

  test 'responds not found for an unknown user' do
    assert_no_difference -> { User.count } do
      post_session(id_token: google_id_token(email: 'new@example.com'))
    end

    assert_response :not_found
    assert_equal({ 'status' => 'not_found', 'private_email' => false }, response.parsed_body)
  end

  test 'creates a confirmed user named after the token when asked' do
    assert_difference -> { User.count } => 1, -> { User::Identity.count } => 1 do
      post_session(id_token: google_id_token(sub: 'google-new', email: 'new@example.com', given_name: 'Ada',
                                             family_name: 'Lovelace'),
                   create: true)
    end

    assert_response :ok
    assert_same true, response.parsed_body['created']
    user = User.find_by!(email: 'new@example.com')
    assert_predicate user, :confirmed?
    assert_equal 'Ada Lovelace', user.name
    assert_equal %w[google_oauth2 google-new], user.identities.sole.slice(:provider, :uid).values
    assert_not user.password_set?
  end

  test 'names the profile after the email without a name in the token' do
    post_session(id_token: google_id_token(sub: 'g1', email: 'skygod@example.com'), create: 'true')

    assert_equal 'skygod', User.find_by!(email: 'skygod@example.com').name
  end

  test 'rejects a token for another audience' do
    post_session(id_token: google_id_token(aud: 'someone-else.apps.googleusercontent.com'))

    assert_response :unauthorized
    assert_predicate response.parsed_body['errors'], :present?
  end

  test 'rejects an expired token' do
    post_session(id_token: google_id_token(exp: 1.minute.ago.to_i))

    assert_response :unauthorized
  end

  test 'rejects a token from another issuer' do
    post_session(id_token: google_id_token(iss: 'https://evil.example.com'))

    assert_response :unauthorized
  end

  test 'rejects a token signed with another key' do
    post_session(id_token: google_id_token(key: OpenSSL::PKey::RSA.generate(2048)))

    assert_response :unauthorized
  end

  test 'creates no user while the Android OAuth application is missing' do
    oauth_applications(:skyderby_android_native).destroy!

    assert_no_difference -> { User.count } do
      post_session(id_token: google_id_token(sub: 'g1', email: 'new@example.com'), create: true)
    end

    assert_response :service_unavailable
  end

  test 'requires an id token' do
    post_session

    assert_response :bad_request
  end

  private

  def post_session(**params)
    with_google_client_ids { post api_v1_google_session_path, params:, as: :json }
  end
end
