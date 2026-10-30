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

  test '#show embeds the track video into BASE Pro View' do
    track = tracks(:track_with_video)
    TrackVideo.create!(track:, url: 'https://youtu.be/uB-t25F1I8g', video_offset: 3, track_offset: 3)
    GiftedSubscription.create!(user: track.pilot.owner)
    sign_in track.pilot.owner

    get track_path(track)

    assert_response :success
    assert_select '.base-jump-video[data-tracks--base-jump-track-target=videoPlayer]'
    assert_select '[data-tracks--base-jump-track-video-code-value]'
  end

  test '#show leaves BASE Pro View without a player when the track has no video' do
    track = tracks(:track_with_video)
    GiftedSubscription.create!(user: track.pilot.owner)
    sign_in track.pilot.owner

    get track_path(track)

    assert_response :success
    assert_select '.base-jump-video', false
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

  test '#index does not respond to json' do
    assert_raises(ActionController::UnknownFormat) do
      get tracks_path(format: :json)
    end
  end

  test '#show limits guests to 60 requests per minute' do
    TracksController.cache_store.stub(:increment, 61) do
      get track_path(@track, format: :json)
    end

    assert_response :too_many_requests
  end

  test '#show allows signed in users more than 60 requests per minute' do
    sign_in @user

    TracksController.cache_store.stub(:increment, 61) do
      get track_path(@track, format: :json)
    end

    assert_response :success
  end

  test '#show limits signed in users to 180 requests per minute' do
    sign_in @user

    TracksController.cache_store.stub(:increment, 181) do
      get track_path(@track, format: :json)
    end

    assert_response :too_many_requests
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
