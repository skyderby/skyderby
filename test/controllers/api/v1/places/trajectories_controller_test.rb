require 'test_helper'

class Api::V1::Places::TrajectoriesControllerTest < ActionDispatch::IntegrationTest
  test '#show returns recent trajectories of the place with speeds in km/h' do
    item = trajectory_item

    assert_equal tracks(:hellesylt).id, item['trackId']
    assert_equal [{ 'latitude' => 62.1, 'longitude' => 6.8, 'hSpeed' => 36.0 }], item['points']
  end

  test '#show returns speeds in m/s when asked' do
    assert_in_delta 10.0, trajectory_item(units: 'ms')['points'].sole['hSpeed']
  end

  private

  def trajectory_item(**params)
    place = places(:hellesylt)
    trajectory = { id: tracks(:hellesylt).id, points: [{ latitude: 62.1, longitude: 6.8, h_speed: 10.0 }] }

    place.stub(:recent_trajectories, [trajectory]) do
      Place.stub(:find, place) { get api_v1_place_trajectories_path(place, **params) }
    end

    assert_response :success
    response.parsed_body['items'].sole
  end
end
