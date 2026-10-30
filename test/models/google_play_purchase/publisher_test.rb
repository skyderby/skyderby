require 'test_helper'

class GooglePlayPurchase::PublisherTest < ActiveSupport::TestCase
  include WebMock::API

  teardown { WebMock.reset! }

  test 'a failing access token request is reported as unavailable' do
    raising = ->(**) { raise Signet::AuthorizationError, 'invalid_grant' }

    with_service_account_json do
      Google::Auth::ServiceAccountCredentials.stub(:make_creds, raising) do
        error = assert_raises(GooglePlayPurchase::Publisher::UnavailableError) do
          GooglePlayPurchase::Publisher.access_token
        end
        assert_match 'invalid_grant', error.message
      end
    end
  end

  test 'a rejected access token is dropped from the cache' do
    stub_request(:get, %r{subscriptionsv2/tokens/token-1}).to_return(status: 401)
    deleted = []

    Rails.cache.stub(:delete, ->(key) { deleted << key }) do
      GooglePlayPurchase::Publisher.stub(:access_token, 'stale') do
        assert_raises(GooglePlayPurchase::Publisher::UnavailableError) do
          GooglePlayPurchase::Publisher.subscription('token-1')
        end
      end
    end

    assert_equal [GooglePlayPurchase::Publisher::ACCESS_TOKEN_CACHE_KEY], deleted
  end

  test 'a missing service account is reported as unavailable' do
    GooglePlayPurchase::Publisher.stub(:service_account_json, nil) do
      assert_raises(GooglePlayPurchase::Publisher::UnavailableError) { GooglePlayPurchase::Publisher.access_token }
    end
  end

  private

  def with_service_account_json
    previous = ENV.fetch('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON', nil)
    ENV['GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'] = '{}'
    Rails.cache.delete(GooglePlayPurchase::Publisher::ACCESS_TOKEN_CACHE_KEY)
    yield
  ensure
    ENV['GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'] = previous
  end
end
