class User::Identity::AppleAuthorization
  AUDIENCE = 'https://appleid.apple.com'.freeze
  TOKEN_URL = URI('https://appleid.apple.com/auth/token')
  REVOKE_URL = URI('https://appleid.apple.com/auth/revoke')

  class << self
    def configured? = credentials.values.all?(&:present?)

    def exchange(authorization_code, client_id: nil)
      return warn_unconfigured('exchange') unless configured?

      client_id ||= default_client_id
      response = post(TOKEN_URL, client_id:, client_secret: client_secret(client_id),
                                 code: authorization_code, grant_type: 'authorization_code')
      return log_failure('exchange', response) unless response.is_a?(Net::HTTPSuccess)

      JSON.parse(response.body)['refresh_token']
    end

    def revoke(refresh_token)
      return warn_unconfigured('revoke') unless configured?

      User::Identity::AppleToken.client_ids.any? do |client_id|
        response = post(REVOKE_URL, client_id:, client_secret: client_secret(client_id),
                                    token: refresh_token, token_type_hint: 'refresh_token')
        response.is_a?(Net::HTTPSuccess)
      end || log_failure('revoke', nil)
    end

    def client_secret(client_id)
      now = Time.current.to_i
      JWT.encode(
        { iss: credentials[:team_id], iat: now, exp: now + 5.minutes.to_i, aud: AUDIENCE, sub: client_id },
        OpenSSL::PKey::EC.new(credentials[:private_key].to_s.gsub('\n', "\n")),
        'ES256',
        { kid: credentials[:key_id] }
      )
    end

    def credentials
      apple = Rails.application.credentials.apple || {}
      {
        team_id: apple[:team_id] || ENV.fetch('APPLE_TEAM_ID', nil),
        key_id: apple[:key_id] || ENV.fetch('APPLE_KEY_ID', nil),
        private_key: apple[:private_key] || ENV.fetch('APPLE_PRIVATE_KEY', nil)
      }
    end

    private

    def default_client_id = User::Identity::AppleToken.client_ids.first

    def post(uri, params)
      Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 5, read_timeout: 10) do |http|
        request = Net::HTTP::Post.new(uri.request_uri)
        request.set_form_data(params)
        http.request(request)
      end
    rescue SocketError, SystemCallError, Timeout::Error, OpenSSL::SSL::SSLError => e
      Rails.logger.warn("Sign in with Apple request to #{uri} failed: #{e.message}")
      nil
    end

    def warn_unconfigured(action)
      Rails.logger.warn("Sign in with Apple credentials are not configured, skipping token #{action}")
      nil
    end

    def log_failure(action, response)
      Rails.logger.warn("Sign in with Apple token #{action} failed: #{response&.code} #{response&.body}")
      nil
    end
  end
end
