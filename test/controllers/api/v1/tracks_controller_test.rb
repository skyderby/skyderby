require 'test_helper'

class Api::V1::TracksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @application = Doorkeeper::Application.create!(
      name: 'Test App',
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: 'read write'
    )
    @token = Doorkeeper::AccessToken.create!(
      application: @application,
      resource_owner_id: @user.id,
      resource_owner_type: 'User',
      scopes: 'read write'
    )
    @read_only_token = Doorkeeper::AccessToken.create!(
      application: @application,
      resource_owner_id: @user.id,
      resource_owner_type: 'User',
      scopes: 'read'
    )

    stub_track_scanner
  end

  test '#create requires authentication' do
    post api_v1_tracks_path, params: { file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml') }

    assert_response :unauthorized
  end

  test '#create requires write scope' do
    post api_v1_tracks_path,
         params: { file: fixture_file_upload('tracks/one_track.gpx', 'application/gpx+xml') },
         headers: { 'Authorization' => "Bearer #{@read_only_token.token}" }

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
           headers: { 'Authorization' => "Bearer #{@token.token}" }
    end

    assert_response :created

    response_json = response.parsed_body
    assert_predicate response_json['id'], :present?
    assert_predicate response_json['url'], :present?

    track = Track.find(response_json['id'])
    assert_equal @user, track.owner
    assert_equal 'skydive', track.kind
  end

  test '#create without file returns error' do
    post api_v1_tracks_path,
         params: { kind: 'skydive' },
         headers: { 'Authorization' => "Bearer #{@token.token}" }

    assert_response :unprocessable_content
  end

  private

  def stub_track_scanner
    TrackScanner.define_method(:call) do
      TrackScanner::NullRange.new(@points)
    end
  end
end
