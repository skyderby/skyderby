require 'test_helper'

class Api::V1::Tournaments::CompetitorsCopiesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @tournament = tournaments(:world_base_race)
    @source = tournaments(:qualification_loen)
    @source.competitors.create!(profile: profiles(:alex), suit: suits(:apache))
  end

  test '#create copies competitors from a viewable tournament' do
    assert_difference '@tournament.competitors.count', 1 do
      post api_v1_tournament_competitors_copy_path(@tournament),
           params: { source_tournament_id: @source.id }, headers: bearer(:regular_user_write), as: :json
    end

    assert_response :no_content
  end

  test '#create does not copy from a tournament the user cannot view' do
    @source.update!(visibility: :private_event, responsible: users(:event_responsible))

    assert_no_difference '@tournament.competitors.count' do
      post api_v1_tournament_competitors_copy_path(@tournament),
           params: { source_tournament_id: @source.id }, headers: bearer(:regular_user_write), as: :json
    end

    assert_response :not_found
  end

  test '#create is forbidden for non organizers' do
    post api_v1_tournament_competitors_copy_path(@tournament),
         params: { source_tournament_id: @source.id }, headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
  end
end
