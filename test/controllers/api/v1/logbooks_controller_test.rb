require 'test_helper'

class Api::V1::LogbooksControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#show returns defaults from the last jump of each kind' do
    profile = profiles(:regular_user)
    profile.jumps.create!(kind: :skydive, number: 41, jumped_at: 2.days.ago, aircraft: 'Twin Otter',
                          equipment: 'Sabre 2 150')
    profile.jumps.create!(kind: :base, number: 7, jumped_at: 1.day.ago, place_name: 'Kjerag')

    get api_v1_logbook_path, headers: bearer(:regular_user_read)

    assert_response :success
    skydive, base = response.parsed_body['kinds']
    assert_equal 'skydive', skydive['kind']
    assert_equal({ 'number' => 42, 'aircraft' => 'Twin Otter', 'equipment' => 'Sabre 2 150' },
                 skydive['defaults'].slice('number', 'aircraft', 'equipment'))
    assert_equal ['Twin Otter'], skydive.dig('suggestions', 'aircraft')
    assert_equal({ 'number' => 8, 'placeLabel' => 'Kjerag' }, base['defaults'].slice('number', 'placeLabel'))
  end
end
