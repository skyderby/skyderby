class GooglePlayPurchase::Publisher
  BASE_URL = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications'.freeze
  SCOPE = 'https://www.googleapis.com/auth/androidpublisher'.freeze
  ACCESS_TOKEN_CACHE_KEY = 'google_play_purchase/publisher/access_token'.freeze

  class UnavailableError < StandardError; end

  INVALID_TOKEN_STATUSES = [400, 404, 410].freeze

  class << self
    def subscription(purchase_token)
      get("purchases/subscriptionsv2/tokens/#{escape(purchase_token)}")
    end

    def product(product_id, purchase_token)
      get("purchases/products/#{escape(product_id)}/tokens/#{escape(purchase_token)}")
    end

    def acknowledge_subscription(product_id, purchase_token)
      post("purchases/subscriptions/#{escape(product_id)}/tokens/#{escape(purchase_token)}:acknowledge")
    end

    def acknowledge_product(product_id, purchase_token)
      post("purchases/products/#{escape(product_id)}/tokens/#{escape(purchase_token)}:acknowledge")
    end

    def access_token
      Rails.cache.fetch(ACCESS_TOKEN_CACHE_KEY, expires_in: 50.minutes) do
        raise UnavailableError, 'Google Play service account is not configured' if service_account_json.blank?

        Google::Auth::ServiceAccountCredentials
          .make_creds(json_key_io: StringIO.new(service_account_json), scope: SCOPE)
          .fetch_access_token!
          .fetch('access_token')
      end
    rescue Signet::AuthorizationError, Faraday::Error, JSON::ParserError, KeyError, ArgumentError,
           OpenSSL::PKey::PKeyError => e
      raise UnavailableError, "Google Play access token: #{e.message}"
    end

    private

    def service_account_json
      Rails.application.credentials.dig(:google_play, :service_account_json) ||
        ENV.fetch('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON', nil)
    end

    def get(path) = parse(request(Net::HTTP::Get, path))

    def post(path)
      response = request(Net::HTTP::Post, path)
      raise UnavailableError, "Google Play acknowledge failed: #{response.code}" if response.code.to_i >= 500

      response.is_a?(Net::HTTPSuccess)
    end

    def parse(response)
      return JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)
      raise GooglePlayPurchase::InvalidError, 'Unknown purchase token' if invalid_token?(response)

      raise UnavailableError, "Google Play responded #{response.code}"
    end

    def invalid_token?(response) = INVALID_TOKEN_STATUSES.include?(response.code.to_i)

    def request(request_class, path)
      uri = URI("#{BASE_URL}/#{GooglePlayPurchase::PACKAGE_NAME}/#{path}")
      Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 5, read_timeout: 10) do |http|
        request = request_class.new(uri.request_uri)
        request['Authorization'] = "Bearer #{access_token}"
        request['Content-Type'] = 'application/json'
        request.body = '{}' if request.request_body_permitted?
        http.request(request)
      end
    rescue SocketError, SystemCallError, Timeout::Error, OpenSSL::SSL::SSLError, JSON::ParserError => e
      raise UnavailableError, e.message
    end

    def escape(value) = ERB::Util.url_encode(value.to_s)
  end
end
