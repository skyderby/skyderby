class User::Identity::AppleToken
  ISSUER = 'https://appleid.apple.com'.freeze
  JWKS_URL = URI('https://appleid.apple.com/auth/keys')
  JWKS_CACHE_KEY = 'user/identity/apple_token/jwks'.freeze
  DEFAULT_CLIENT_IDS = %w[io.skyderby.app io.skyderby.app.dev].freeze

  class InvalidToken < StandardError; end

  attr_reader :uid, :email, :client_id

  def initialize(payload)
    @uid = payload['sub']
    @email = payload['email'].presence
    @client_id = payload['aud']
    @private_email = ActiveModel::Type::Boolean.new.cast(payload['is_private_email']) ||
                     User::Identity.private_email?(@email)
  end

  def private_email? = @private_email

  def identity = User::Identity.find_by(provider: User::Identity::APPLE, uid:)

  def identity_attributes = { provider: User::Identity::APPLE, uid:, email:, private_email: private_email? }.compact

  class << self
    def verify(token)
      raise InvalidToken, 'Identity token is missing' if token.blank?

      payload, = JWT.decode(
        token.to_s, nil, true,
        algorithms: ['RS256'], jwks: method(:jwks),
        iss: ISSUER, verify_iss: true,
        aud: client_ids, verify_aud: true,
        verify_expiration: true
      )
      raise InvalidToken, 'Identity token has no subject' if payload['sub'].blank?

      new(payload)
    rescue JWT::DecodeError => e
      raise InvalidToken, e.message
    end

    def client_ids
      configured = Rails.application.credentials.dig(:apple, :client_ids) || ENV.fetch('APPLE_CLIENT_IDS', nil)
      ids = configured.is_a?(String) ? configured.split(',') : Array(configured)
      ids.map { it.to_s.strip }.compact_blank.presence || DEFAULT_CLIENT_IDS
    end

    private

    def jwks(options)
      return fetch_jwks.tap { Rails.cache.write(JWKS_CACHE_KEY, it, expires_in: 1.day) } if options[:kid_not_found]

      Rails.cache.fetch(JWKS_CACHE_KEY, expires_in: 1.day) { fetch_jwks }
    end

    def fetch_jwks
      options = { use_ssl: true, open_timeout: 5, read_timeout: 5 }
      response = Net::HTTP.start(JWKS_URL.host, JWKS_URL.port, **options) { it.get(JWKS_URL.request_uri) }
      raise JWT::DecodeError, 'Could not fetch Apple public keys' unless response.is_a?(Net::HTTPSuccess)

      JSON.parse(response.body)
    rescue SocketError, SystemCallError, Timeout::Error, JSON::ParserError, OpenSSL::SSL::SSLError
      raise JWT::DecodeError, 'Could not fetch Apple public keys'
    end
  end
end
