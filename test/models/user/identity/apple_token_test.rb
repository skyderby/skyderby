require 'test_helper'

class User::Identity::AppleTokenTest < ActiveSupport::TestCase
  include AppleIdentityTokenHelper

  setup { stub_apple_jwks }

  test 'verifies a token and extracts claims' do
    token = User::Identity::AppleToken.verify(apple_identity_token(sub: 'abc', email: 'pilot@example.com'))

    assert_equal 'abc', token.uid
    assert_equal 'pilot@example.com', token.email
    assert_equal 'io.skyderby.app', token.client_id
    assert_not token.private_email?
  end

  test 'reads is_private_email as a string or a boolean' do
    from_string = User::Identity::AppleToken.verify(apple_identity_token(private_email: true))
    from_bool = User::Identity::AppleToken.verify(apple_identity_token(is_private_email: true))

    assert_predicate from_string, :private_email?
    assert_predicate from_bool, :private_email?
  end

  test 'treats relay addresses as private' do
    token = User::Identity::AppleToken.verify(apple_identity_token(email: 'x1y2@privaterelay.appleid.com',
                                                                   is_private_email: nil))

    assert_predicate token, :private_email?
  end

  test 'accepts the dev bundle id' do
    token = User::Identity::AppleToken.verify(apple_identity_token(aud: 'io.skyderby.app.dev'))

    assert_equal 'io.skyderby.app.dev', token.client_id
  end

  test 'rejects an unknown audience' do
    assert_raises(User::Identity::AppleToken::InvalidToken) do
      User::Identity::AppleToken.verify(apple_identity_token(aud: 'com.example.other'))
    end
  end

  test 'rejects a wrong issuer' do
    assert_raises(User::Identity::AppleToken::InvalidToken) do
      User::Identity::AppleToken.verify(apple_identity_token(iss: 'https://example.com'))
    end
  end

  test 'rejects an expired token' do
    assert_raises(User::Identity::AppleToken::InvalidToken) do
      User::Identity::AppleToken.verify(apple_identity_token(exp: 1.minute.ago.to_i))
    end
  end

  test 'rejects a token signed by another key' do
    assert_raises(User::Identity::AppleToken::InvalidToken) do
      User::Identity::AppleToken.verify(apple_identity_token(key: OpenSSL::PKey::RSA.generate(2048)))
    end
  end

  test 'rejects a blank token' do
    assert_raises(User::Identity::AppleToken::InvalidToken) { User::Identity::AppleToken.verify('') }
  end

  test 'refetches the keys once when the key id is unknown' do
    rotated = OpenSSL::PKey::RSA.generate(2048)
    old_jwk = JWT::JWK.new(apple_signing_key.public_key, kid: 'old')
    new_jwk = JWT::JWK.new(rotated.public_key, kid: 'rotated')
    stub_request(:get, User::Identity::AppleToken::JWKS_URL.to_s)
      .to_return({ status: 200, body: { keys: [old_jwk.export] }.to_json },
                 { status: 200, body: { keys: [new_jwk.export] }.to_json })

    token = User::Identity::AppleToken.verify(apple_identity_token(key: rotated, kid: 'rotated'))

    assert_equal 'apple-user-001', token.uid
    assert_requested :get, User::Identity::AppleToken::JWKS_URL.to_s, times: 2
  end

  test 'fails when the keys cannot be fetched' do
    stub_request(:get, User::Identity::AppleToken::JWKS_URL.to_s).to_return(status: 503)

    assert_raises(User::Identity::AppleToken::InvalidToken) do
      User::Identity::AppleToken.verify(apple_identity_token)
    end
  end

  test 'client ids come from the environment' do
    ENV['APPLE_CLIENT_IDS'] = 'one, two'

    assert_equal %w[one two], User::Identity::AppleToken.client_ids
  ensure
    ENV.delete('APPLE_CLIENT_IDS')
  end
end
