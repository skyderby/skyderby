require 'test_helper'

class Api::V1::BoogiesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
  end

  test '#show returns boogie details' do
    get api_v1_boogie_path(@boogie)

    assert_response :success
    body = response.parsed_body
    assert_equal 'boogie', body['type']
    assert_equal 2, body['numberOfResultsForTotal']
    assert_equal ['Boogie Open'], body['categories'].pluck('name')
    assert_equal [1, 2], body['rounds'].pluck('number')
    assert_equal 4, body['competitors'].size
  end

  test '#show returns not found for drafts' do
    @boogie.update_column(:status, :draft)

    get api_v1_boogie_path(@boogie)

    assert_response :not_found
  end

  test '#show exposes deletable for the responsible' do
    get api_v1_boogie_path(@boogie), headers: bearer(:event_responsible_write)

    assert_response :success
    assert response.parsed_body['deletable']
    assert response.parsed_body['editable']
  end

  test '#create creates a boogie owned by the current user' do
    assert_difference -> { Boogie.count }, 1 do
      post api_v1_boogies_path, params: { event: event_params }, headers: bearer(:regular_user_write), as: :json
    end

    assert_response :created
    body = response.parsed_body
    event = Boogie.find(body['id'])
    assert_equal users(:regular_user), event.responsible
    assert_equal 'New Boogie', body['name']
    assert_equal({ 'from' => 3000, 'to' => 1800 }, body['window'])
    assert_equal 3, body['numberOfResultsForTotal']
    assert body['deletable']
  end

  test '#create returns validation errors' do
    post api_v1_boogies_path, params: { event: event_params.merge(name: '') },
                              headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#create rejects an unknown status' do
    post api_v1_boogies_path, params: { event: event_params.merge(status: 'bogus') },
                              headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end

  test '#create requires a write token' do
    post api_v1_boogies_path, params: { event: event_params }, headers: bearer(:regular_user_read), as: :json

    assert_response :forbidden
  end

  test '#update changes the boogie and broadcasts on status change' do
    assert_enqueued_jobs 2, only: Turbo::Streams::ActionBroadcastJob do
      patch api_v1_boogie_path(@boogie), params: { event: { name: 'Renamed', status: 'finished' } },
                                         headers: bearer(:event_responsible_write), as: :json
    end

    assert_response :success
    assert_equal 'Renamed', response.parsed_body['name']
    assert_equal 'finished', response.parsed_body['status']
    assert_predicate @boogie.reload, :finished?
  end

  test '#update changes the detail etag' do
    get api_v1_boogie_path(@boogie), headers: bearer(:event_responsible_write)
    etag = response.headers['ETag']

    patch api_v1_boogie_path(@boogie), params: { event: { range_from: 2800 } },
                                       headers: bearer(:event_responsible_write), as: :json
    get api_v1_boogie_path(@boogie), headers: bearer(:event_responsible_write).merge('If-None-Match' => etag)

    assert_response :success
    assert_equal 2800, response.parsed_body.dig('window', 'from')
  end

  test '#update is forbidden for non editors' do
    patch api_v1_boogie_path(@boogie), params: { event: { name: 'Renamed' } },
                                       headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
    assert_equal 'Hungary Boogie', @boogie.reload.name
  end

  private

  def event_params
    {
      name: 'New Boogie',
      starts_at: '2026-10-10',
      place_id: places(:ravenna).id,
      range_from: 3000,
      range_to: 1800,
      status: 'draft',
      visibility: 'public_event',
      number_of_results_for_total: 3
    }
  end
end
