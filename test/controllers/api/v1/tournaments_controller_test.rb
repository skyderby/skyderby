require 'test_helper'

class Api::V1::TournamentsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#show returns tournament details' do
    get api_v1_tournament_path(tournaments(:world_base_race))

    assert_response :success
    body = response.parsed_body
    assert_equal 'tournament', body['type']
    assert_equal 'WBR', body['name']
    assert_equal 'published', body['status']
    assert_equal 2, body['bracketSize']
    assert_equal ['bracket'], body['boards'].pluck('key')
    assert_equal 'legacy', body.dig('finishLine', 'name')
    assert_in_delta 62.0573629049, body.dig('finishLine', 'start', 'latitude')
    assert_equal ['John'], body['competitors'].pluck('name')
    assert_not body['competitors'].first['isDisqualified']
  end

  test '#show changes etag when an older competitor is deleted' do
    tournament = tournaments(:world_base_race)
    older = tournament.competitors.create!(profile: profiles(:john), suit: suits(:apache), updated_at: 1.day.ago)
    get api_v1_tournament_path(tournament)
    etag = response.headers['ETag']

    older.delete
    get api_v1_tournament_path(tournament), headers: { 'If-None-Match' => etag }

    assert_response :success
  end

  test '#show lists qualification rounds and refreshes when one is added' do
    tournament = tournaments(:world_base_race)
    get api_v1_tournament_path(tournament)
    etag = response.headers['ETag']

    round = tournament.qualification_rounds.create!
    get api_v1_tournament_path(tournament), headers: { 'If-None-Match' => etag }

    assert_response :success
    assert_includes response.parsed_body['rounds'].pluck('id'), round.id
  end

  test '#show hides private tournaments from non participants' do
    tournaments(:world_base_race).update_column(:visibility, :private_event)

    get api_v1_tournament_path(tournaments(:world_base_race)), headers: bearer(:event_responsible_write)
    assert_response :not_found

    get api_v1_tournament_path(tournaments(:world_base_race)), headers: bearer(:regular_user_read)
    assert_response :success
  end

  test '#create lets an admin create a tournament' do
    params = {
      event: {
        name: 'New Race', place_id: places(:hellesylt_wbr).id,
        finish_line_id: place_finish_lines(:hellesylt_wbr_legacy).id,
        starts_at: '2026-08-01', bracket_size: 4, has_qualification: true,
        qualification_scoring: 'last_completed_round', visibility: 'unlisted_event'
      }
    }

    assert_difference 'Tournament.count' do
      post api_v1_tournaments_path, params:, headers: bearer(:admin_write), as: :json
    end

    assert_response :created
    body = response.parsed_body
    assert_equal 'New Race', body['name']
    assert_equal 4, body['bracketSize']
    assert body['hasQualification']
    assert_equal 'last_completed_round', body['qualificationScoring']
    assert_equal users(:admin), Tournament.find(body['id']).responsible
  end

  test '#create is forbidden for non admins' do
    post api_v1_tournaments_path,
         params: { event: { name: 'New Race' } }, headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end

  test '#create rejects a finish line from another place' do
    params = {
      event: {
        name: 'New Race', place_id: places(:hellesylt_wbr).id,
        finish_line_id: place_finish_lines(:loen_wbr).id
      }
    }

    assert_no_difference 'Tournament.count' do
      post api_v1_tournaments_path, params:, headers: bearer(:admin_write), as: :json
    end

    assert_response :unprocessable_content
  end

  test '#update changes settings and status' do
    tournament = tournaments(:world_base_race)

    patch api_v1_tournament_path(tournament),
          params: { event: { name: 'WBR 2026', status: 'finished', visibility: 'private_event' } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_equal 'WBR 2026', response.parsed_body['name']
    assert_equal 'finished', response.parsed_body['status']
    assert_predicate tournament.reload, :finished?
    assert_predicate tournament, :private_event?
  end

  test '#update is forbidden for non organizers' do
    patch api_v1_tournament_path(tournaments(:world_base_race)),
          params: { event: { name: 'Hacked' } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
    assert_equal 'WBR', tournaments(:world_base_race).reload.name
  end

  test '#update rejects an unknown status' do
    patch api_v1_tournament_path(tournaments(:world_base_race)),
          params: { event: { status: 'bogus' } }, headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end

  test '#update rejects a missing place' do
    patch api_v1_tournament_path(tournaments(:world_base_race)),
          params: { event: { place_id: nil } }, headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end
end
