require 'test_helper'

class Tracks::HeadPositionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @track = create_track_from_file('speed_skydiving_411.csv', kind: :speed_skydiving, suit: nil)
    attach_sensor_data(@track) { |time| time < @track.exited_at + 10 ? [0.0, 0.0, 1.0] : [0.0, 0.0, -1.0] }
    sign_in @user
  end

  test '#show returns head position from +90 head-up to -90 head-down' do
    get track_head_position_path(@track), as: :json

    assert_response :success
    pitches = response.parsed_body['positions'].to_h { [Time.zone.parse(it['gpsTime']), it['pitch']] }
    assert_in_delta 90, pitches.find { |time, _| time.between?(@track.exited_at + 2, @track.exited_at + 8) }.last, 1
    assert_in_delta(-90, pitches.find { |time, _| time > @track.exited_at + 12 }.last, 1)
  end

  test '#show is forbidden for a private track of another pilot' do
    @track.update!(visibility: :private_track)

    get track_head_position_path(@track), as: :json

    assert_response :forbidden
  end
end
