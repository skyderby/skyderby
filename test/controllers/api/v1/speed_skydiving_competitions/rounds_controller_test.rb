require 'test_helper'

class Api::Web::SpeedSkydivingCompetitions::RoundsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @event = speed_skydiving_competitions(:nationals)
    @round = @event.rounds.find_by(number: 1)
    @last_round = @event.rounds.ordered.last
    @round_attributes = %w[id number completed createdAt updatedAt].sort
  end

  test '#index - forbidden if user does not have access to event' do
    @event.draft!

    get api_v1_speed_skydiving_competition_rounds_url(@event)

    assert_response :forbidden
  end

  test '#index - responds with rounds if user have access' do
    sign_in @user

    @event.published!
    @event.competitors.create!(profile: @user.profile, category: @event.categories.first)

    get api_v1_speed_skydiving_competition_rounds_url(@event)

    assert_response :success
    assert response.parsed_body.all? { _1.keys.sort == @round_attributes }
  end

  test '#create - forbidden if user does not have permissions' do
    sign_in @user
    rounds_count_before_request = @event.rounds.count

    post api_v1_speed_skydiving_competition_rounds_url(@event)

    assert_response :forbidden
    assert_equal rounds_count_before_request, @event.rounds.count
  end

  test '#create - rejected if event finished' do
    sign_in @event.responsible
    @event.finished!

    post api_v1_speed_skydiving_competition_rounds_url(@event)

    assert_response :unprocessable_entity
    assert_equal(
      { 'errors' => { 'base' => ["Changes couldn't be made because event is finished."] } },
      response.parsed_body
    )
  end

  test '#create - responds with newly created round' do
    sign_in @event.responsible
    @event.rounds.delete_all

    assert_difference -> { @event.rounds.count } => 1 do
      post api_v1_speed_skydiving_competition_rounds_url(@event)
    end

    assert_response :success
    assert_equal @round_attributes, response.parsed_body.keys.sort
    assert_equal 1, response.parsed_body['number']
  end

  test '#update - forbidden if user does not have permissions' do
    sign_in @user

    assert_no_changes -> { @round.reload.completed_at } do
      put api_v1_speed_skydiving_competition_round_url(@event, @round), params: { round: { completed: true } }
    end

    assert_response :forbidden
  end

  test '#update - rejected if event finished' do
    sign_in @event.responsible
    @event.finished!

    assert_no_changes -> { @round.reload.completed_at } do
      put api_v1_speed_skydiving_competition_round_url(@event, @round), params: { round: { completed: true } }
    end

    assert_response :unprocessable_entity
    assert_equal(
      { 'errors' => { 'base' => ["Changes couldn't be made because event is finished."] } },
      response.parsed_body
    )
  end

  test '#update - responds with updated round' do
    sign_in @event.responsible

    put api_v1_speed_skydiving_competition_round_url(@event, @round), params: { round: { completed: true } }

    assert_response :success
    assert_equal @round_attributes, response.parsed_body.keys.sort
    assert response.parsed_body['completed']
    assert_predicate @round.reload, :completed?
  end

  test '#destroy - forbidden if user does not have permissions' do
    sign_in @user

    assert_no_changes -> { @event.rounds.count } do
      delete api_v1_speed_skydiving_competition_round_url(@event, @last_round)
    end

    assert_response :forbidden
  end

  test '#destroy - rejected if event finished' do
    sign_in @event.responsible
    @event.finished!

    assert_no_changes -> { @event.rounds.count } do
      delete api_v1_speed_skydiving_competition_round_url(@event, @last_round)
    end

    assert_response :unprocessable_entity
    assert_equal(
      { 'errors' => { 'base' => ["Changes couldn't be made because event is finished."] } },
      response.parsed_body
    )
  end

  test '#destroy - responds with deleted round' do
    sign_in @event.responsible

    assert_difference -> { @event.rounds.count } => -1 do
      delete api_v1_speed_skydiving_competition_round_url(@event, @last_round)
    end
    assert_response :success
    assert_equal @round_attributes, response.parsed_body.keys.sort
    assert_equal @last_round.id, response.parsed_body['id']
  end
end
