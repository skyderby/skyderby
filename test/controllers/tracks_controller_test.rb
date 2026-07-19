require 'test_helper'

class TracksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @responsible = create(:user)
    @organizer = create(:user)
    @event = create(:event, responsible: @responsible)
    @track = create(:empty_track, :with_point, owner: @user)
    @private_track = create(:empty_track, :with_point, owner: @user, visibility: Track.visibilities[:private_track])
    @event_track = create(:empty_track, :with_point, owner: @event)
    create(:event_organizer, organizable: @event, user: @organizer)
  end

  test '#index orders by speed independently of other disciplines' do
    faster = create(:empty_track, :with_point, owner: @user)
    slower = create(:empty_track, :with_point, owner: @user)

    faster.create_speed!(discipline: :speed, result: 100)
    faster.create_time!(discipline: :time, result: 5)
    slower.create_speed!(discipline: :speed, result: 50)
    slower.create_time!(discipline: :time, result: 100)

    get tracks_path(order: '-speed', suit_id: [faster.suit_id, slower.suit_id])

    assert_response :success
    body = @response.body
    assert_operator body.index(track_path(faster)), :<, body.index(track_path(slower)),
                    'expected higher-speed track to be listed before lower-speed track'
  end

  test 'owner of track #edit' do
    sign_in @user
    get edit_track_path(@track)
    assert_response :success
  end

  test 'owner of track #show private track owned by user' do
    sign_in @user
    get track_path(@private_track)
    assert_response :success
  end

  test 'track belongs to event #edit by responsible' do
    sign_in @responsible
    get edit_track_path(@event_track)
    assert_response :success
  end

  test 'track belongs to event #edit by organizer' do
    sign_in @organizer
    get edit_track_path(@event_track)
    assert_response :success
  end
end
