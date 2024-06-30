require 'test_helper'

class Api::V1::TracksControllerTest < ActionDispatch::IntegrationTest
  test '#index - has correct keys in response' do
    get api_v1_tracks_url

    assert_equal %w[currentPage items relations totalPages], response.parsed_body.keys.sort
    assert_not_empty response.parsed_body['items']
    record_keys = %w[
      id
      kind
      visibility
      profileId
      suitId
      placeId
      missingSuitName
      location
      pilotName
      distance
      speed
      time
      comment
      createdAt
      updatedAt
      recordedAt
    ].sort
    response.parsed_body['items'].each do |record|
      assert_equal record_keys, record.keys.sort
    end
  end

  test '#index - scope by policy' do
    visible_track = tracks(:hellesylt)
    hidden_track = tracks(:track_with_video).tap(&:private_track!)

    get api_v1_tracks_url

    track_ids = response.parsed_body['items'].map { |track| track['id'] }

    assert_includes track_ids, visible_track.id
    assert_not_includes track_ids, hidden_track.id
  end

  test '#show - renders correct keys' do
    track = tracks(:hellesylt)

    get api_v1_track_url(track)

    assert_response :success
    verify_response_structure(response.parsed_body)
  end

  test '#show - when do not have access to track' do
    track = tracks(:hellesylt)
    track.private_track!

    get api_v1_track_url(track)

    assert_response :forbidden
  end

  test '#update - updates track' do
    sign_in users(:regular_user)

    track = tracks(:hellesylt)
    track.update(owner: users(:regular_user))

    put api_v1_track_url(track), params: { track: { comment: 'NEW COMMENT' } }

    assert_response :success
    verify_response_structure(response.parsed_body)
    assert_equal 'NEW COMMENT', track.reload.comment
  end

  test 'when not owner' do
    sign_in users(:regular_user)

    track = tracks(:hellesylt)
    track.update(owner: users(:admin))

    put api_v1_track_url(track), params: { track: { comment: 'NEW COMMENT' } }

    assert_response :forbidden
  end

  test '#destroy - when owner' do
    sign_in users(:regular_user)

    track = tracks(:track_with_video)
    track.update(owner: users(:regular_user))

    delete api_v1_track_url(track)

    assert_response :success
    verify_response_structure(response.parsed_body)
  end

  test '#destroy - when it cannot be deleted due to depentend records' do
    sign_in users(:regular_user)

    track = tracks(:hellesylt)
    track.update(owner: users(:regular_user))

    delete api_v1_track_url(track)

    assert_response :unprocessable_entity
    assert_equal(
      {
        'errors' => {
          'base' => ['Cannot delete record because a dependent event result exists']
        }
      },
      response.parsed_body
    )
  end

  test '#destroy - when not allowed' do
    sign_in users(:regular_user)

    track = tracks(:hellesylt)
    track.update(owner: users(:admin))

    delete api_v1_track_url(track)

    assert_response :forbidden
  end

  def verify_response_structure(parsed_body)
    assert_equal(
      %w[comment
         createdAt
         dataFrequency
         hasVideo
         id
         jumpRange
         kind
         location
         missingSuitName
         permissions
         pilotName
         placeId
         profileId
         recordedAt
         relations
         suitId
         updatedAt
         visibility],
      parsed_body.keys.sort
    )
    assert_equal %w[from to], parsed_body['jumpRange'].keys.sort
    assert_equal %w[canDownload canEdit canEditOwnership], parsed_body['permissions'].keys.sort
  end
end
