require 'test_helper'

class Api::V1::Logbook::JumpsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  UUID = '0b6a2f4e-5c1d-4e8a-9f3b-7d2c1e0a4b59'.freeze

  setup do
    @profile = profiles(:regular_user)
  end

  test '#create records a jump under the client uuid' do
    post_jump(kind: 'base', number: 12, object_type: 'span', wind_strength: 'light', wind_direction: 'left')

    assert_response :created
    jump = @profile.jumps.sole
    assert_equal UUID, jump.client_uuid
    assert_predicate jump, :base?
    assert_equal %w[span light left], [jump.object_type, jump.wind_strength, jump.wind_direction]
    assert_equal UUID, response.parsed_body['clientUuid']
    assert_equal 12, response.parsed_body['number']
  end

  test '#create is idempotent for the same client uuid' do
    2.times { post_jump(number: 1) }

    assert_response :success
    assert_equal 1, @profile.jumps.count
  end

  test '#create rejects an invalid client uuid' do
    post_jump(client_uuid: 'not-a-uuid')

    assert_response :unprocessable_content
    assert_empty @profile.jumps
  end

  test '#create rejects an unknown wind value' do
    post_jump(kind: 'base', wind_strength: 'hurricane')

    assert_response :unprocessable_content
  end

  test '#create is forbidden with a read token' do
    post_jump(headers: bearer(:regular_user_read))

    assert_response :forbidden
  end

  test '#update changes the jump found by client uuid' do
    jump = create_jump(number: 3)

    patch api_v1_logbook_jump_path(jump.client_uuid), params: { jump: { number: 4, notes: 'Windy' } },
                                                      headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_equal [4, 'Windy'], [jump.reload.number, jump.notes]
  end

  test '#update of a deleted jump is gone' do
    jump = create_jump
    jump.discard

    patch api_v1_logbook_jump_path(jump.client_uuid), params: { jump: { number: 4 } },
                                                      headers: bearer(:regular_user_write), as: :json

    assert_response :gone
  end

  test '#update cannot touch another profile\'s jump' do
    jump = profiles(:admin).jumps.create!(jumped_at: 1.day.ago)

    patch api_v1_logbook_jump_path(jump.client_uuid), params: { jump: { number: 4 } },
                                                      headers: bearer(:regular_user_write), as: :json

    assert_response :not_found
  end

  test '#destroy soft deletes and is idempotent' do
    jump = create_jump

    2.times { delete api_v1_logbook_jump_path(jump.client_uuid), headers: bearer(:regular_user_write) }

    assert_response :no_content
    assert_predicate jump.reload.deleted_at, :present?
  end

  test '#index returns changes including deletions and pages with a cursor' do
    kept = create_jump(number: 1)
    deleted = create_jump(number: 2)
    deleted.discard

    get api_v1_logbook_jumps_path(limit: 1), headers: bearer(:regular_user_read)

    first = response.parsed_body
    assert first['hasMore']
    assert_equal [kept.client_uuid], first['items'].pluck('clientUuid')

    get api_v1_logbook_jumps_path(limit: 1, since: first['cursor']), headers: bearer(:regular_user_read)

    second = response.parsed_body
    assert_equal [deleted.client_uuid], second['items'].pluck('clientUuid')
    assert second['items'].first['deletedAt']
    assert_not second['hasMore']
  end

  test '#index only lists own jumps' do
    profiles(:admin).jumps.create!(jumped_at: 1.day.ago)

    get api_v1_logbook_jumps_path, headers: bearer(:regular_user_read)

    assert_empty response.parsed_body['items']
  end

  test '#index rejects an invalid cursor' do
    get api_v1_logbook_jumps_path(since: 'garbage'), headers: bearer(:regular_user_read)

    assert_response :bad_request
  end

  test 'the logbook is hidden while impersonating' do
    impersonation = Impersonation.start!(admin: users(:admin), user: users(:regular_user),
                                         application: oauth_access_tokens(:admin_write).application)

    get api_v1_logbook_jumps_path, headers: { 'Authorization' => "Bearer #{impersonation.access_token.token}" }

    assert_response :forbidden
  end

  private

  def create_jump(**attributes)
    @profile.jumps.create!(jumped_at: 1.day.ago, **attributes)
  end

  def post_jump(headers: bearer(:regular_user_write), **attributes)
    post api_v1_logbook_jumps_path,
         params: { jump: { client_uuid: UUID, jumped_at: 2.hours.ago.iso8601 }.merge(attributes) },
         headers:, as: :json
  end
end
