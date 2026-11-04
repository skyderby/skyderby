require 'test_helper'

class Api::V1::VirtualCompetitions::ParticipantsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @competition = virtual_competitions(:feather_challenge) }

  test '#index lists participants for ranking administrators' do
    get api_v1_virtual_competition_participants_path(@competition), headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal 2, response.parsed_body['items'].size
    assert_includes response.parsed_body['items'].pluck('profile').pluck('name'), 'Regular user'
  end

  test '#index is refused to other users' do
    get api_v1_virtual_competition_participants_path(@competition), headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#create adds a participant' do
    post api_v1_virtual_competition_participants_path(@competition),
         params: { profile_id: profiles(:admin).id, admin: true }, headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    assert_predicate @competition.participants.find_by!(profile: profiles(:admin)), :admin?
  end

  test '#update changes the role and #destroy removes the participant' do
    participant = @competition.participants.find_by!(profile: profiles(:regular_user))

    patch api_v1_virtual_competition_participant_path(@competition, participant),
          params: { admin: false }, headers: bearer(:event_responsible_write), as: :json
    assert_response :success

    delete api_v1_virtual_competition_participant_path(@competition, participant),
           headers: bearer(:event_responsible_write)
    assert_response :success
    assert_not VirtualCompetition::Participant.exists?(participant.id)
  end

  test 'ranking details tell administrators they can manage participants' do
    get api_v1_virtual_competition_path(@competition), headers: bearer(:event_responsible_write)

    assert response.parsed_body['competition']['participantsManageable']
  end
end
