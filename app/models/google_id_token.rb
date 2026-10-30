class GoogleIdToken
  ISSUERS = %w[https://accounts.google.com accounts.google.com].freeze
  JWKS_URL = URI('https://www.googleapis.com/oauth2/v3/certs')
  JWKS_CACHE_KEY = 'google_id_token/jwks'.freeze

  class InvalidToken < StandardError; end

  class << self
    def decode(token, audience:)
      raise InvalidToken, 'Identity token is missing' if token.blank?

      payload, = JWT.decode(
        token.to_s, nil, true,
        algorithms: ['RS256'], jwks: method(:jwks),
        iss: ISSUERS, verify_iss: true,
        aud: audience, verify_aud: true,
        verify_expiration: true
      )
      raise InvalidToken, 'Identity token has no subject' if payload['sub'].blank?

      payload
    rescue JWT::DecodeError => e
      raise InvalidToken, e.message
    end

    private

    def jwks(options)
      return fetch_jwks.tap { Rails.cache.write(JWKS_CACHE_KEY, it, expires_in: 1.hour) } if options[:kid_not_found]

      Rails.cache.fetch(JWKS_CACHE_KEY, expires_in: 1.hour) { fetch_jwks }
    end

    def fetch_jwks
      options = { use_ssl: true, open_timeout: 5, read_timeout: 5 }
      response = Net::HTTP.start(JWKS_URL.host, JWKS_URL.port, **options) { it.get(JWKS_URL.request_uri) }
      raise JWT::DecodeError, 'Could not fetch Google public keys' unless response.is_a?(Net::HTTPSuccess)

      JSON.parse(response.body)
    rescue SocketError, SystemCallError, Timeout::Error, JSON::ParserError, OpenSSL::SSL::SSLError
      raise JWT::DecodeError, 'Could not fetch Google public keys'
    end
  end
end
