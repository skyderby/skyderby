require 'test_helper'

class Api::V1::PlacesControllerTest < ActionDispatch::IntegrationTest
  test '#show returns place details' do
    place = places(:hellesylt)

    get api_v1_place_url(place)

    assert_response :success
    body = response.parsed_body
    assert_equal 'Hellesylt', body['name']
    assert_equal 'base', body['kind']
    assert_in_delta 62.057917, body['latitude']
    assert_equal({ 'id' => countries(:norway).id, 'name' => 'Norway', 'code' => 'NOR' }, body['country'])
    assert_equal [place_finish_lines(:hellesylt).id], body['finishLines'].pluck('id')
    assert_equal 12, body['popularTimes'].size
    assert_empty body['photos']
    assert_nil body['coverPhotoUrl']
    %w[terrainProfileIds lastTrackRecordedAt tracksCount recentTrackIds visitedCount visitedProfiles].each do |key|
      assert body.key?(key), "missing #{key}"
    end
  end

  test '#show responds 404 for missing place' do
    get api_v1_place_url(0)

    assert_response :not_found
  end
end
