require 'test_helper'

class OauthMobileAppFlowTest < ActionDispatch::IntegrationTest
  setup do
    @application = oauth_applications(:skyderby_apple)
    @verifier = SecureRandom.urlsafe_base64(48)
    @challenge = Base64.urlsafe_encode64(Digest::SHA256.digest(@verifier), padding: false)
    sign_in users(:regular_user)
  end

  test 'authorization code with PKCE issues token usable by the api' do
    code = authorize

    post oauth_token_path, params: token_params(code:, code_verifier: @verifier)

    assert_response :success
    token = response.parsed_body
    assert_predicate token['access_token'], :present?
    assert_predicate token['refresh_token'], :present?
    assert_equal 'read write', token['scope']

    get api_v1_current_path, headers: { 'Authorization' => "Bearer #{token['access_token']}" }

    assert_response :success
    assert_equal users(:regular_user).id, response.parsed_body.dig('user', 'id')
  end

  test 'token exchange fails with wrong code verifier' do
    code = authorize

    post oauth_token_path, params: token_params(code:, code_verifier: SecureRandom.urlsafe_base64(48))

    assert_response :bad_request
    assert_equal 'invalid_grant', response.parsed_body['error']
  end

  test 'mobile app redirect uri with custom scheme is valid' do
    assert_predicate @application, :valid?
  end

  private

  def authorize
    authorization_params = {
      client_id: @application.uid,
      redirect_uri: @application.redirect_uri,
      response_type: 'code',
      scope: 'read write',
      code_challenge: @challenge,
      code_challenge_method: 'S256'
    }

    get oauth_authorization_path, params: authorization_params
    assert_response :success

    post oauth_authorization_path, params: authorization_params
    assert_response :redirect
    location = URI.parse(response.location)
    assert_equal 'io.skyderby.app', location.scheme

    Rack::Utils.parse_query(location.query).fetch('code')
  end

  def token_params(code:, code_verifier:)
    {
      grant_type: 'authorization_code',
      client_id: @application.uid,
      redirect_uri: @application.redirect_uri,
      code:,
      code_verifier:
    }
  end
end
