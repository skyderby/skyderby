module GoogleIdTokenHelper
  extend ActiveSupport::Concern
  include WebMock::API

  included do
    teardown { WebMock.reset! }
  end

  GOOGLE_TEST_KID = 'google-test-key'.freeze
  GOOGLE_TEST_CLIENT_ID = 'test-client.apps.googleusercontent.com'.freeze

  def google_signing_key
    @google_signing_key ||= OpenSSL::PKey::RSA.generate(2048)
  end

  def stub_google_jwks(key = google_signing_key, kid: GOOGLE_TEST_KID)
    Rails.cache.delete(GoogleIdToken::JWKS_CACHE_KEY)
    jwk = JWT::JWK.new(key.public_key, kid:, use: 'sig', alg: 'RS256')
    stub_request(:get, GoogleIdToken::JWKS_URL.to_s)
      .to_return(status: 200, body: { keys: [jwk.export] }.to_json, headers: { 'Content-Type' => 'application/json' })
  end

  def google_id_token(kid: GOOGLE_TEST_KID, key: google_signing_key, **claims)
    payload = {
      iss: 'https://accounts.google.com',
      aud: GOOGLE_TEST_CLIENT_ID,
      sub: 'google-user-001',
      email: 'pilot@example.com',
      email_verified: true,
      iat: Time.current.to_i,
      exp: 10.minutes.from_now.to_i
    }.merge(claims).compact
    JWT.encode(payload, key, 'RS256', { kid: })
  end

  def with_google_client_ids(ids = [GOOGLE_TEST_CLIENT_ID], &)
    User::Identity::GoogleToken.stub(:client_ids, ids, &)
  end
end
