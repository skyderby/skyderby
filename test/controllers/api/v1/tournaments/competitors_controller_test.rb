require 'test_helper'

class Api::V1::Tournaments::CompetitorsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @tournament = tournaments(:world_base_race) }

  test '#create adds a competitor with an existing profile' do
    post api_v1_tournament_competitors_path(@tournament),
         params: { competitor: { profile_id: profiles(:alex).id, suit_id: suits(:apache).id } },
         headers: bearer(:regular_user_write), as: :json

    assert_response :created
    assert_equal profiles(:alex).id, response.parsed_body.dig('profile', 'id')
    assert_same false, response.parsed_body['isDisqualified']
  end

  test '#create changes the tournament detail' do
    get api_v1_tournament_path(@tournament)
    etag = response.headers['ETag']

    post api_v1_tournament_competitors_path(@tournament),
         params: { competitor: { profile_id: profiles(:alex).id, suit_id: suits(:apache).id } },
         headers: bearer(:regular_user_write), as: :json
    get api_v1_tournament_path(@tournament), headers: { 'If-None-Match' => etag }

    assert_response :success
    assert_equal 2, response.parsed_body['competitors'].size
  end

  test '#create creates an event owned profile' do
    params = {
      competitor: { suit_id: suits(:apache).id,
                    profile_attributes: { name: 'Brand New Jumper', country_id: countries(:norway).id } }
    }

    post api_v1_tournament_competitors_path(@tournament), params:, headers: bearer(:regular_user_write), as: :json

    assert_response :created
    assert response.parsed_body['profileOwnedByEvent']
    assert_equal @tournament, Tournament::Competitor.find(response.parsed_body['id']).profile.owner
  end

  test '#update renames an event owned profile in place' do
    profile = Profile.create!(name: 'Old Name', owner: @tournament)
    competitor = @tournament.competitors.create!(profile:, suit: suits(:apache))

    patch api_v1_tournament_competitor_path(@tournament, competitor),
          params: { competitor: { profile_attributes: { name: 'New Name' } } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_equal 'New Name', profile.reload.name
    assert_equal profile, competitor.reload.profile
  end

  test '#create renders validation errors' do
    post api_v1_tournament_competitors_path(@tournament),
         params: { competitor: { profile_id: profiles(:alex).id } },
         headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#update disqualifies a competitor' do
    competitor = tournament_competitors(:race_competitor)

    patch api_v1_tournament_competitor_path(@tournament, competitor),
          params: { competitor: { is_disqualified: true, disqualification_reason: 'Late' } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert response.parsed_body['isDisqualified']
    assert_equal 'Late', competitor.reload.disqualification_reason
  end

  test '#destroy refuses to delete a competitor with results' do
    delete api_v1_tournament_competitor_path(@tournament, tournament_competitors(:race_competitor)),
           headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
  end

  test '#destroy deletes a competitor' do
    competitor = @tournament.competitors.create!(profile: profiles(:alex), suit: suits(:apache))

    delete api_v1_tournament_competitor_path(@tournament, competitor), headers: bearer(:regular_user_write)

    assert_response :no_content
    assert_not Tournament::Competitor.exists?(competitor.id)
  end

  test '#create is forbidden for non organizers' do
    post api_v1_tournament_competitors_path(@tournament),
         params: { competitor: { profile_id: profiles(:alex).id, suit_id: suits(:apache).id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
  end
end
