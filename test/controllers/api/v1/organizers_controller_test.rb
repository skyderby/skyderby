require 'test_helper'

class Api::Web::OrganizersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = speed_skydiving_competitions(:nationals)
    @organizer = users(:regular_user)
  end

  test 'Speed skydiving competition - #index - when does not have permission' do
    @event.draft!

    get api_v1_speed_skydiving_competition_organizers_url(@event)

    assert_response :forbidden
  end

  test 'Speed skydiving competition - #index - when have permissions' do
    @event.published!
    @event.organizers.create!(user: @organizer)

    get api_v1_speed_skydiving_competition_organizers_url(@event)

    assert_response :success
    assert_equal 1, response.parsed_body['items'].size
    assert_equal 1, response.parsed_body['relations']['profiles'].size
    assert_equal @organizer.profile.id, response.parsed_body['items'].first['profileId']
    assert_equal @organizer.profile.id, response.parsed_body['relations']['profiles'].first['id']
  end

  test 'Speed skydiving competition - #create - when not allowed' do
    post api_v1_speed_skydiving_competition_organizers_url(@event), params: { user_id: @organizer.id }

    assert_response :forbidden
  end

  test 'Speed skydiving competition - #create - adds organizer to event' do
    @event.update!(responsible: users(:event_responsible))

    sign_in @event.responsible

    assert_changes -> { @event.organizers.count }, from: 0, to: 1 do
      post api_v1_speed_skydiving_competition_organizers_url(@event),
           params: { organizer: { user_id: @organizer.id } }
    end

    assert_response :success
    assert_equal @organizer.id, response.parsed_body['userId']
    assert_equal @organizer.profile.id, response.parsed_body['profileId']
  end

  test 'Speed skydiving competition - #destroy - when not allowed' do
    record = @event.organizers.create!(user: @organizer)

    assert_no_changes -> { @event.organizers.count } do
      delete api_v1_speed_skydiving_competition_organizer_url(@event, record.id)
    end

    assert_response :forbidden
  end

  test 'Speed skydiving competition - #destroy - remopves organizer from event' do
    record = @event.organizers.create!(user: @organizer)

    sign_in @event.responsible

    assert_difference -> { @event.organizers.count } => -1 do
      delete api_v1_speed_skydiving_competition_organizer_url(@event, record.id)
    end

    assert_response :success
    assert_equal @organizer.id, response.parsed_body['userId']
    assert_equal @organizer.profile.id, response.parsed_body['profileId']
  end
end
