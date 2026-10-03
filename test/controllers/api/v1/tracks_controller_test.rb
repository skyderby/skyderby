require 'test_helper'

class Api::V1::TracksControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper
  include ActiveJob::TestHelper

  setup do
    @user = users(:regular_user)
    @track = tracks(:hellesylt)
  end

  test '#index returns paginated public tracks for guests' do
    tracks(:boogie_track_1).private_track!

    get api_v1_tracks_path, params: { per: 2 }

    assert_response :success
    body = response.parsed_body
    assert_equal 2, body['items'].size
    assert_equal 1, body['page']
    assert_equal 2, body['perPage']
    assert_equal Track.public_track.count, body['totalCount']
    assert_equal (Track.public_track.count / 2.0).ceil, body['totalPages']
    assert_not_includes body['items'].pluck('id'), tracks(:boogie_track_1).id
  end

  test '#index renders track list items' do
    get api_v1_tracks_path, params: { kind: 'base' }

    assert_response :success
    item = response.parsed_body['items'].find { |track| track['id'] == @track.id }
    assert_equal 'base', item['kind']
    assert_equal 'public_track', item['visibility']
    pilot = { 'id' => profiles(:regular_user).id, 'name' => 'Regular user', 'countryCode' => nil,
              'contributor' => false }
    assert_equal pilot, item['pilot']
    assert_equal 'Hellesylt', item.dig('place', 'name')
    assert_equal 'NOR', item.dig('place', 'countryCode')
    assert_equal({ 'distance' => nil, 'speed' => nil, 'time' => nil }, item['results'])
    assert_not item['hasVideo']
    assert_not item['owned']
    assert_equal %w[base], response.parsed_body['items'].pluck('kind').uniq
  end

  test '#index caps per page' do
    get api_v1_tracks_path, params: { per: 1000 }

    assert_equal 100, response.parsed_body['perPage']
  end

  test '#index includes own private tracks for token owner' do
    @track.private_track!

    get api_v1_tracks_path, headers: bearer(:regular_user_write)

    assert_includes response.parsed_body['items'].pluck('id'), @track.id
  end

  test '#index rejects invalid tokens' do
    get api_v1_tracks_path, headers: bearer(:expired)

    assert_response :unauthorized
    assert_predicate response.parsed_body['errors'], :present?
  end

  test '#show renders track detail' do
    @track.update!(owner: @user)

    get api_v1_track_path(@track), headers: bearer(:regular_user_read)

    assert_response :success
    body = response.parsed_body
    assert_equal @track.id, body['id']
    assert_equal 0, body['ffStart']
    assert_equal 33, body['ffEnd']
    assert body['editable']
    assert body['owned']
    assert body['absAltitude']
    assert_not body['proViewAvailable']
    assert_equal @track.updated_at.to_i.to_s, body['pointsVersion']
    assert_in_delta 62.057917, body.dig('place', 'latitude')
    assert_empty body['onlineCompetitionResults']
    assert_equal 'performance_competition', body.dig('eventResult', 'eventKind')
    assert_nil body['video']
  end

  test '#show omits event result when its event is gone' do
    @track.event_result.round.update_column(:event_id, nil)

    get api_v1_track_path(@track)

    assert_response :success
    assert_nil response.parsed_body['eventResult']
  end

  test '#show returns 404 for private track of someone else' do
    @track.private_track!

    get api_v1_track_path(@track)

    assert_response :not_found
    assert_equal ['Not found'], response.parsed_body['errors']
  end

  test '#show returns 404 for missing track' do
    get api_v1_track_path(id: 0)

    assert_response :not_found
  end

  test '#create requires authentication' do
    post api_v1_tracks_path, params: { file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml') }

    assert_response :unauthorized
  end

  test '#create requires write scope' do
    post api_v1_tracks_path,
         params: { file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml') },
         headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#create with valid token and file' do
    assert_difference 'Track.count', 1 do
      post api_v1_tracks_path,
           params: {
             file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml'),
             kind: 'skydive',
             visibility: 'public_track'
           },
           headers: bearer(:regular_user_write)
    end

    assert_response :created

    response_json = response.parsed_body
    assert_predicate response_json['id'], :present?
    assert_predicate response_json['url'], :present?
    assert_not response_json['firstLook']

    track = Track.find(response_json['id'])
    assert_equal @user, track.owner
    assert_equal 'skydive', track.kind
  end

  test '#create stores a FlySight 2 sensor file next to the track' do
    post api_v1_tracks_path,
         params: {
           file: fixture_file_upload('tracks/fs2-track.csv'),
           sensor_file: fixture_file_upload('tracks/fs2-sensor.csv'),
           kind: 'speed_skydiving'
         },
         headers: bearer(:regular_user_write)

    assert_response :created
    track_file = Track.find(response.parsed_body['id']).track_file
    assert_equal 'fs2-track.csv', track_file.file.filename.to_s
    assert_equal 'fs2-sensor.csv.gz', track_file.sensor_file.filename.to_s
  end

  test '#create rejects a sensor file from another session' do
    post api_v1_tracks_path,
         params: {
           file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml'),
           sensor_file: fixture_file_upload('tracks/fs2-sensor.csv')
         },
         headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
  end

  test '#create is idempotent by client uuid' do
    client_uuid = SecureRandom.uuid
    params = { file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml'), clientUuid: client_uuid }

    post api_v1_tracks_path, params:, headers: bearer(:regular_user_write)
    assert_response :created
    track_id = response.parsed_body['id']

    assert_no_difference 'Track.count' do
      post api_v1_tracks_path,
           params: { file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml'),
                     clientUuid: client_uuid },
           headers: bearer(:regular_user_write)
    end

    assert_response :ok
    assert_equal track_id, response.parsed_body['id']
    assert_equal client_uuid, Track.find(track_id).client_uuid
  end

  test '#create rejects malformed client uuid' do
    post api_v1_tracks_path,
         params: { file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml'), clientUuid: 'nope' },
         headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
  end

  test '#create without file returns error' do
    post api_v1_tracks_path,
         params: { kind: 'skydive' },
         headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
    assert_equal ['File is required'], response.parsed_body['errors']
  end

  test '#update changes editable track and enqueues processing jobs' do
    @track.update!(owner: @user)

    patch api_v1_track_path(@track),
          params: { comment: 'Updated', jumpRange: '5;30', visibility: 'unlisted_track' },
          headers: bearer(:regular_user_write)

    assert_response :success
    assert_equal 'Updated', response.parsed_body['comment']
    assert_equal 5, response.parsed_body['ffStart']
    assert_equal 30, @track.reload.ff_end
    assert_enqueued_with job: ResultsJob, args: [@track.id]
    assert_enqueued_with job: ExitProfileJob, args: [@track.id]
  end

  test '#update accepts nested track params' do
    @track.update!(owner: @user)

    patch api_v1_track_path(@track), params: { track: { comment: 'Nested' } }, headers: bearer(:regular_user_write)

    assert_response :success
    assert_equal 'Nested', @track.reload.comment
  end

  test '#update clears place and suit with explicit nulls' do
    @track.update!(owner: @user)

    patch api_v1_track_path(@track),
          params: { track: { place_id: nil, location: 'Somewhere', suit_id: nil, missing_suit_name: 'Custom' } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    @track.reload
    assert_nil @track.place_id
    assert_nil @track.suit_id
    assert_equal 'Somewhere', @track.location
    assert_equal 'Custom', response.parsed_body['missingSuitName']
  end

  test '#update forbidden for tracks of other users' do
    patch api_v1_track_path(@track), params: { comment: 'Nope' }, headers: bearer(:regular_user_write)

    assert_response :forbidden
    assert_equal ['Forbidden'], response.parsed_body['errors']
  end

  test '#update returns validation errors' do
    @track.update!(owner: @user, pilot: nil, name: 'Pilot')

    patch api_v1_track_path(@track), params: { name: '' }, headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
    assert_predicate response.parsed_body['errors'], :present?
  end

  test '#update ignores disqualification from non admins' do
    @track.update!(owner: @user, disqualified_from_online_competitions: true)

    patch api_v1_track_path(@track),
          params: { disqualifiedFromOnlineCompetitions: false },
          headers: bearer(:regular_user_write)

    assert_response :success
    assert @track.reload.disqualified_from_online_competitions
  end

  test '#update lets admins change disqualification' do
    patch api_v1_track_path(@track),
          params: { disqualifiedFromOnlineCompetitions: true },
          headers: bearer(:admin_write)

    assert_response :success
    assert @track.reload.disqualified_from_online_competitions
  end

  test '#update requires write scope' do
    @track.update!(owner: @user)

    patch api_v1_track_path(@track), params: { comment: 'Nope' }, headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#destroy removes editable track' do
    track = Track.create!(owner: @user, pilot: profiles(:regular_user), kind: :skydive)

    assert_difference 'Track.count', -1 do
      delete api_v1_track_path(track), headers: bearer(:regular_user_write)
    end

    assert_response :no_content
  end

  test '#destroy returns errors when track is used in competition' do
    @track.update!(owner: @user)

    assert_no_difference 'Track.count' do
      delete api_v1_track_path(@track), headers: bearer(:regular_user_write)
    end

    assert_response :unprocessable_content
    assert_predicate response.parsed_body['errors'], :present?
  end

  test '#destroy requires authentication' do
    delete api_v1_track_path(@track)

    assert_response :unauthorized
  end

  test '#destroy forbidden for tracks of other users' do
    assert_no_difference 'Track.count' do
      delete api_v1_track_path(@track), headers: bearer(:regular_user_write)
    end

    assert_response :forbidden
  end
end
