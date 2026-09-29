require 'test_helper'

class Api::V1::ImpersonationsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#create issues a short-lived token without refresh for the target user' do
    freeze_time do
      assert_difference -> { Impersonation.count } => 1, -> { Doorkeeper::AccessToken.count } => 1 do
        impersonate({ userId: users(:regular_user).id })
      end

      assert_response :created
      body = response.parsed_body
      token = Doorkeeper::AccessToken.find_by!(token: body['accessToken'])
      assert_equal users(:regular_user).id, token.resource_owner_id
      assert_equal oauth_access_tokens(:admin_write).application_id, token.application_id
      assert_equal 'read write', token.scopes.to_s
      assert_equal 1.hour.to_i, token.expires_in
      assert_nil token.refresh_token
      assert_equal 1.hour.from_now.iso8601, body['expiresAt']
      assert_equal({ 'id' => users(:regular_user).id, 'email' => users(:regular_user).email }, body['user'])
      assert_equal profiles(:regular_user).id, body.dig('profile', 'id')
      assert_equal 'Regular user', body.dig('profile', 'name')
      assert body['profile'].key?('countryCode')
      assert_equal '/images/thumb/missing.png', body.dig('profile', 'photo', 'thumb')

      impersonation = Impersonation.last
      assert_equal users(:admin), impersonation.admin_user
      assert_equal users(:regular_user), impersonation.user
      assert_equal token, impersonation.access_token
      assert_equal Time.current, impersonation.started_at
      assert_nil impersonation.ended_at
    end
  end

  test '#create accepts profile id' do
    impersonate({ profileId: profiles(:regular_user).id })

    assert_response :created
    assert_equal users(:regular_user).id, response.parsed_body.dig('user', 'id')
  end

  test '#create requires authentication' do
    post api_v1_impersonations_path, params: { userId: users(:regular_user).id }, as: :json

    assert_response :unauthorized
  end

  test '#create is forbidden for non-admins' do
    assert_no_difference -> { Impersonation.count }, -> { Doorkeeper::AccessToken.count } do
      post api_v1_impersonations_path, params: { userId: users(:event_responsible).id },
                                       headers: bearer(:regular_user_write), as: :json
    end

    assert_response :forbidden
  end

  test '#create requires write scope' do
    impersonate({ userId: users(:regular_user).id }, headers: bearer(:admin_read))

    assert_response :forbidden
    assert_equal 0, Impersonation.count
  end

  test '#create is forbidden with an impersonation token' do
    token = start_impersonation.access_token.token
    users(:regular_user).update!(roles: ['admin'])

    assert_no_difference -> { Impersonation.count } do
      post api_v1_impersonations_path, params: { userId: users(:event_responsible).id },
                                       headers: { 'Authorization' => "Bearer #{token}" }, as: :json
    end

    assert_response :forbidden
  end

  test '#create refuses to impersonate an administrator' do
    other_admin = User.create!(email: 'other-admin@example.com', password: 'password123', confirmed_at: Time.current,
                               roles: ['admin'])

    assert_no_difference -> { Impersonation.count }, -> { Doorkeeper::AccessToken.count } do
      post api_v1_impersonations_path, params: { userId: other_admin.id }, headers: bearer(:admin_write), as: :json
    end

    assert_response :unprocessable_content
  end

  test '#create refuses to impersonate yourself' do
    post api_v1_impersonations_path, params: { userId: users(:admin).id }, headers: bearer(:admin_write), as: :json

    assert_response :unprocessable_content
    assert_equal 0, Impersonation.count
  end

  test '#create requires a target' do
    post api_v1_impersonations_path, headers: bearer(:admin_write), as: :json

    assert_response :bad_request
  end

  test '#create returns not found for unknown user' do
    post api_v1_impersonations_path, params: { userId: 0 }, headers: bearer(:admin_write), as: :json

    assert_response :not_found
  end

  test 'impersonation token stops working after an hour and cannot be refreshed' do
    impersonation = start_impersonation
    headers = { 'Authorization' => "Bearer #{impersonation.access_token.token}" }

    get api_v1_current_path, headers: headers
    assert_response :success
    assert_equal users(:regular_user).id, response.parsed_body.dig('user', 'id')

    travel 61.minutes do
      get api_v1_current_path, headers: headers
      assert_response :unauthorized
    end
  end

  test 'impersonation token stops working when the admin loses the role' do
    impersonation = start_impersonation
    users(:admin).update!(roles: [])

    get api_v1_current_path, headers: { 'Authorization' => "Bearer #{impersonation.access_token.token}" }

    assert_response :unauthorized
  end

  test '#destroy revokes the impersonation token' do
    impersonation = start_impersonation
    headers = { 'Authorization' => "Bearer #{impersonation.access_token.token}" }

    delete api_v1_impersonation_path, headers: headers

    assert_response :no_content
    assert_predicate impersonation.reload.ended_at, :present?
    assert_predicate impersonation.access_token.reload, :revoked?

    get api_v1_current_path, headers: headers
    assert_response :unauthorized
  end

  test '#destroy with a regular token is not found' do
    delete api_v1_impersonation_path, headers: bearer(:admin_write)

    assert_response :not_found
    assert_not_predicate oauth_access_tokens(:admin_write).reload, :revoked?
  end

  test '#destroy requires authentication' do
    delete api_v1_impersonation_path

    assert_response :unauthorized
  end

  private

  def impersonate(params, headers: bearer(:admin_write))
    post api_v1_impersonations_path, params:, headers:, as: :json
  end

  def start_impersonation
    Impersonation.start!(admin: users(:admin), user: users(:regular_user),
                         application: oauth_applications(:skyderby_apple))
  end
end
