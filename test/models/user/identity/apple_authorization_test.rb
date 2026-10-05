require 'test_helper'

class User::Identity::AppleAuthorizationTest < ActiveSupport::TestCase
  include AppleIdentityTokenHelper

  test 'exchange and revoke are no-ops without credentials' do
    assert_not User::Identity::AppleAuthorization.configured?
    assert_nil User::Identity::AppleAuthorization.exchange('code')
    assert_nil User::Identity::AppleAuthorization.revoke('refresh')
    assert_not_requested :post, User::Identity::AppleAuthorization::TOKEN_URL.to_s
  end

  test 'exchanges an authorization code for a refresh token' do
    stub_request(:post, User::Identity::AppleAuthorization::TOKEN_URL.to_s)
      .with(body: hash_including('code' => 'auth-code', 'grant_type' => 'authorization_code',
                                 'client_id' => 'io.skyderby.app.dev'))
      .to_return(status: 200, body: { refresh_token: 'refresh-123', access_token: 'x' }.to_json)

    with_apple_credentials do
      assert_equal 'refresh-123',
                   User::Identity::AppleAuthorization.exchange('auth-code', client_id: 'io.skyderby.app.dev')
    end
  end

  test 'signs the client secret with ES256' do
    credentials = apple_credentials

    secret = User::Identity::AppleAuthorization.stub(:credentials, credentials) do
      User::Identity::AppleAuthorization.client_secret('io.skyderby.app')
    end
    key = OpenSSL::PKey::EC.new(credentials[:private_key])
    payload, header = JWT.decode(secret, key, true, algorithms: ['ES256'])

    assert_equal 'KEY1234567', header['kid']
    assert_equal 'TEAM123456', payload['iss']
    assert_equal 'io.skyderby.app', payload['sub']
    assert_equal 'https://appleid.apple.com', payload['aud']
  end

  test 'returns nil when the exchange fails' do
    stub_request(:post, User::Identity::AppleAuthorization::TOKEN_URL.to_s)
      .to_return(status: 400, body: { error: 'invalid_grant' }.to_json)

    with_apple_credentials do
      assert_nil User::Identity::AppleAuthorization.exchange('bad-code')
    end
  end

  test 'revokes a refresh token' do
    stub_request(:post, User::Identity::AppleAuthorization::REVOKE_URL.to_s)
      .with(body: hash_including('token' => 'refresh-123', 'token_type_hint' => 'refresh_token'))
      .to_return(status: 200)

    with_apple_credentials do
      assert User::Identity::AppleAuthorization.revoke('refresh-123')
    end
    assert_requested :post, User::Identity::AppleAuthorization::REVOKE_URL.to_s, times: 1
  end

  private

  def with_apple_credentials(&)
    User::Identity::AppleAuthorization.stub(:credentials, apple_credentials, &)
  end
end
