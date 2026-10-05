module AppleIdentityTokenHelper
  extend ActiveSupport::Concern
  include WebMock::API

  included do
    teardown { WebMock.reset! }
  end

  APPLE_TEST_KID = 'apple-test-key'.freeze

  def apple_signing_key
    @apple_signing_key ||= OpenSSL::PKey::RSA.generate(2048)
  end

  def stub_apple_jwks(key = apple_signing_key, kid: APPLE_TEST_KID)
    jwk = JWT::JWK.new(key.public_key, kid:, use: 'sig', alg: 'RS256')
    stub_request(:get, User::Identity::AppleToken::JWKS_URL.to_s)
      .to_return(status: 200, body: { keys: [jwk.export] }.to_json, headers: { 'Content-Type' => 'application/json' })
  end

  def apple_identity_token(private_email: false, kid: APPLE_TEST_KID, key: apple_signing_key, **claims)
    payload = {
      iss: User::Identity::AppleToken::ISSUER,
      aud: 'io.skyderby.app',
      sub: 'apple-user-001',
      email: 'pilot@example.com',
      is_private_email: private_email.to_s,
      iat: Time.current.to_i,
      exp: 10.minutes.from_now.to_i
    }.merge(claims).compact
    JWT.encode(payload, key, 'RS256', { kid: })
  end

  def apple_credentials
    { team_id: 'TEAM123456', key_id: 'KEY1234567', private_key: OpenSSL::PKey::EC.generate('prime256v1').to_pem }
  end
end
