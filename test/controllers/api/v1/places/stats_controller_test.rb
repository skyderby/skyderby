require 'test_helper'

class Api::Web::Places::StatsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @place = Place.create! \
      name: 'Borki',
      country: countries(:russia),
      latitude: 56.7983919982,
      longitude: 37.3312257975,
      msl: 127
  end

  test 'when there is no jumps made' do
    get api_v1_place_stats_url(@place)

    assert_equal (1..12).map(&:to_s), response.parsed_body['popularTimes'].keys
    assert response.parsed_body['popularTimes'].values.all? { _1 == { 'trackCount' => 0, 'peopleCount' => 0 } }
  end

  test 'when there are jumps' do
    profile = Profile.create! name: 'Athlete', country: countries(:russia)

    create_list :empty_track, 1, place: @place, recorded_at: Date.parse('2022-02-20')
    create_list :empty_track, 3, place: @place, recorded_at: Date.parse('2022-03-20')
    create_list :empty_track, 2, place: @place, pilot: profile, recorded_at: Date.parse('2022-04-20')

    get api_v1_place_stats_url(@place)

    assert_equal (1..12).map(&:to_s), response.parsed_body['popularTimes'].keys
    assert_equal({ 'trackCount' => 1, 'peopleCount' => 1 }, response.parsed_body.dig('popularTimes', '2'))
    assert_equal({ 'trackCount' => 3, 'peopleCount' => 3 }, response.parsed_body.dig('popularTimes', '3'))
    assert_equal({ 'trackCount' => 2, 'peopleCount' => 1 }, response.parsed_body.dig('popularTimes', '4'))
    assert_equal '2022-04-20T00:00:00Z', response.parsed_body['lastTrackRecordedAt']
  end
end
