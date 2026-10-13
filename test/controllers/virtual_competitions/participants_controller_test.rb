require 'test_helper'

class VirtualCompetitions::ParticipantsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    @competition = virtual_competitions(:feather_challenge)
    sign_in users(:event_responsible)
  end

  test 'ranking administrator sees participants with their roles' do
    get virtual_competition_participants_path(@competition)

    assert_response :success
    assert_select '.roster__item', 2
    assert_select '.roster__item', text: /Regular user/
    assert_select '.roster__item select[name="participant[admin]"]', 2
  end

  test 'opens the add participant dialog' do
    get new_virtual_competition_participant_path(@competition), as: :turbo_stream

    assert_response :success
    assert_select 'turbo-stream[target=modal-root] form#participant_form' do
      assert_select 'select[name="participant[profile_id]"]'
      assert_select 'input[type=checkbox][name="participant[admin]"]'
    end
  end

  test 'adds a participant and schedules scanning of their tracks' do
    assert_enqueued_with(job: VirtualCompetition::ParticipantScoringJob) do
      post virtual_competition_participants_path(@competition),
           params: { participant: { profile_id: profiles(:admin).id, admin: '1' } }, as: :turbo_stream
    end

    assert_response :success
    assert_predicate @competition.participants.find_by!(profile: profiles(:admin)), :admin?
  end

  test 'keeps the dialog open when a pilot without an account is made an administrator' do
    post virtual_competition_participants_path(@competition),
         params: { participant: { profile_id: profiles(:john).id, admin: '1' } }, as: :turbo_stream

    assert_response :unprocessable_content
    assert_select 'turbo-stream[target=participant_form]'
    assert_not @competition.participant?(profiles(:john))
  end

  test 'promotes a participant to administrator' do
    participant = virtual_competition_participants(:regular_user_in_feather_challenge)

    patch virtual_competition_participant_path(@competition, participant),
          params: { participant: { admin: 'true' } }, as: :turbo_stream

    assert_predicate participant.reload, :admin?
    assert @competition.manageable_by?(users(:regular_user))
  end

  test 'removing participant deletes their results' do
    track = create :empty_track, kind: Track.kinds[:base], pilot: profiles(:regular_user)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track:, result: 100)

    delete virtual_competition_participant_path(@competition,
                                                virtual_competition_participants(:regular_user_in_feather_challenge))

    assert_not @competition.participant?(profiles(:regular_user))
    assert_empty @competition.results.reload
  end

  test 'participant who is not an administrator cannot manage participants' do
    sign_in users(:regular_user)

    get virtual_competition_participants_path(@competition)

    assert_response :forbidden
  end
end
