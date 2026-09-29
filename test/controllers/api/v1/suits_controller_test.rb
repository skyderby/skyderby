require 'test_helper'

class Api::V1::SuitsControllerTest < ActionDispatch::IntegrationTest
  test '#index - returns correct fields' do
    get api_v1_suits_url

    fields = response.parsed_body.map(&:keys).flatten.uniq.sort

    assert_equal %w[category id makeCode make name].sort, fields
  end

  test '#show returns suit details' do
    suit = suits(:apache)
    Suit::ExitPerformance.create!(suit:, pilots_count: 12, jumps_count: 40, samples: [{ drop: 0, mid: 0 }])

    get api_v1_suit_url(suit)

    assert_response :success
    body = response.parsed_body
    assert_equal 'Apache Series', body['name']
    assert_equal 'wingsuit', body['kind']
    assert_equal({ 'id' => manufacturers(:tony).id, 'name' => 'Tony Suits', 'code' => 'TS' }, body['manufacturer'])
    assert_equal({ 'pilotsCount' => 12, 'jumpsCount' => 40, 'reliable' => true,
                   'samples' => [{ 'drop' => 0, 'mid' => 0 }] }, body['exitPerformance'])
    %w[tracksCount pilotsCount recentTrackIds].each { |key| assert body.key?(key), "missing #{key}" }
  end

  test '#show returns null exit performance when absent' do
    get api_v1_suit_url(suits(:oneshot))

    assert_nil response.parsed_body['exitPerformance']
  end
end
