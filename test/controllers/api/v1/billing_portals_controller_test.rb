require 'test_helper'

class Api::V1::BillingPortalsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper
  include WebMock::API

  teardown { WebMock.reset! }

  test '#create requires authentication' do
    post api_v1_billing_portal_path

    assert_response :unauthorized
  end

  test '#create returns the Stripe billing portal url' do
    stub_request(:post, 'https://api.stripe.com/v1/customers')
      .to_return(status: 200, body: { id: 'cus_test', object: 'customer' }.to_json)
    stub_request(:post, 'https://api.stripe.com/v1/billing_portal/sessions')
      .to_return(status: 200, body: { id: 'bps_test', object: 'billing_portal.session',
                                      url: 'https://billing.stripe.com/session/test' }.to_json)

    post api_v1_billing_portal_path, headers: bearer(:regular_user_write)

    assert_response :success
    assert_equal 'https://billing.stripe.com/session/test', response.parsed_body['url']
  end
end
