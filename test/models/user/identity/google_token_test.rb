require 'test_helper'

class User::Identity::GoogleTokenTest < ActiveSupport::TestCase
  test 'client ids combine the configured list with the web client id without changing credentials' do
    configured = %w[android-id]
    credentials = { client_ids: configured, client_id: 'web-id' }

    Rails.application.credentials.stub(:dig, ->(*keys) { credentials[keys.last] }) do
      2.times { assert_equal %w[android-id web-id], User::Identity::GoogleToken.client_ids }
    end

    assert_equal %w[android-id], configured
  end
end
