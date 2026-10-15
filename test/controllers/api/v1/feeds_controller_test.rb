require 'test_helper'

class Api::V1::FeedsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @user = users(:admin)
    profiles(:regular_user).follow(user: @user)
  end

  test 'requires authentication' do
    get api_v1_feed_path

    assert_response :unauthorized
  end

  test 'returns track groups of followed pilots' do
    get api_v1_feed_path, headers: bearer(:admin_read)

    assert_response :success
    body = response.parsed_body
    assert body['following']
    group = body['items'].find { it['type'] == 'tracks' }
    assert_equal profiles(:regular_user).id, group.dig('profile', 'id')
    assert_predicate group['tracks'], :any?
  end

  test 'returns competitions with their podium and followed pilots' do
    events(:nationals).update!(starts_at: Time.zone.today)
    profiles(:john).follow(user: @user)

    get api_v1_feed_path, headers: bearer(:admin_read)

    card = response.parsed_body['items'].find do |item|
      item['type'] == 'competition' && item.dig('event', 'id') == events(:nationals).id
    end
    assert_equal 'performance_competition', card.dig('event', 'type')
    assert_includes card['podium'].map { it.dig('profile', 'id') } + card['followedWithoutResults'].pluck('id'),
                    profiles(:john).id
  end

  test 'returns top ten entries of followed pilots' do
    competition = virtual_competitions(:distance_in_time)
    competition.update!(period_to: nil)
    track = tracks(:hellesylt)
    track.update!(recorded_at: Time.current)
    competition.results.create!(track:, result: 2000)
    VirtualCompetition::TopEntry.record(track)

    get api_v1_feed_path, headers: bearer(:admin_read)

    card = response.parsed_body['items'].find { it['type'] == 'ranking' }
    assert_equal competition.id, card.dig('competition', 'id')
    assert_equal([[1, track.id]], card['rows'].map { [it['rank'], it['trackId']] })
  end

  test 'pages back to older activity' do
    Track.where(pilot: profiles(:regular_user)).update_all(created_at: 3.months.ago)

    get api_v1_feed_path, headers: bearer(:admin_read)
    older = response.parsed_body['olderUntilDate']

    get api_v1_feed_path(until: older), headers: bearer(:admin_read)

    assert(response.parsed_body['items'].any? { it['type'] == 'tracks' })
  end
end
