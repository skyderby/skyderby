require 'test_helper'

class Api::V1::Logbook::TrackImportsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @profile = profiles(:regular_user)
    @track = tracks(:hellesylt)
    @track.update!(recorded_at: Time.zone.local(2026, 5, 1, 10), exited_at: Time.zone.local(2026, 5, 1, 10))
  end

  test '#show lists tracks not yet in the logbook by year' do
    get api_v1_logbook_track_import_path, params: { kind: 'base' }, headers: bearer(:regular_user_read)

    assert_response :success
    body = response.parsed_body
    assert_equal 'base', body['kind']
    assert_includes body['years'], 2026
    assert_equal 2026, body['year']
    assert_includes body['tracks'].pluck('id'), @track.id
  end

  test '#create records the selected tracks' do
    post api_v1_logbook_track_import_path,
         params: { kind: 'base', track_ids: [@track.id] }, headers: bearer(:regular_user_write), as: :json

    assert_response :created
    assert_equal 1, response.parsed_body['imported']
    assert_equal @track, @profile.jumps.sole.track
  end

  test '#create ignores tracks of other pilots' do
    post api_v1_logbook_track_import_path,
         params: { kind: 'skydive', track_ids: [tracks(:boogie_track_1).id] },
         headers: bearer(:regular_user_write), as: :json

    assert_equal 0, response.parsed_body['imported']
  end
end
