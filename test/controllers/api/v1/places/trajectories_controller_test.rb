require 'test_helper'

class Api::V1::Places::TrajectoriesControllerTest < ActionDispatch::IntegrationTest
  test '#show returns recent trajectories of the place' do
    place = places(:hellesylt)
    trajectory = { id: tracks(:hellesylt).id, points: [{ latitude: 62.1, longitude: 6.8, h_speed: 120 }] }

    place.stub(:recent_trajectories, [trajectory]) do
      Place.stub(:find, place) { get api_v1_place_trajectories_path(place) }
    end

    assert_response :success
    item = response.parsed_body['items'].sole
    assert_equal tracks(:hellesylt).id, item['trackId']
    assert_equal [{ 'latitude' => 62.1, 'longitude' => 6.8, 'hSpeed' => 120.0 }], item['points']
  end
end
