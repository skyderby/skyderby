require 'test_helper'

class GooglePlayPurchase::PublisherTest < ActiveSupport::TestCase
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

  test 'a missing service account is reported as unavailable' do
    assert_raises(GooglePlayPurchase::Publisher::UnavailableError) { GooglePlayPurchase::Publisher.access_token }
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
