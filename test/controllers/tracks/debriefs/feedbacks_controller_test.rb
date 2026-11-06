require 'test_helper'

class Tracks::Debriefs::FeedbacksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = users(:regular_user)
    @track = create_track_from_file('WBR/Yegor_16_Round3.CSV', kind: :base, pilot: profiles(:regular_user))
    @track.update!(owner: @owner)
    @debrief = Track::Debrief.create!(track: @track, user: @owner, discipline_key: 'flare-0', locale: 'en',
                                      inputs: {}, inputs_digest: 'x', fingerprint: 'x', status: :ready)
  end

  test 'records a rating and then a comment from the reader of the debrief' do
    sign_in @owner

    patch track_debrief_feedback_path(@track, @debrief), params: { feedback: { feedback: 'down' } }
    assert_select 'textarea[name=?]', 'feedback[feedback_comment]'

    patch track_debrief_feedback_path(@track, @debrief), params: { feedback: { feedback_comment: 'Missed the turn' } }

    assert_equal ['down', 'Missed the turn'], [@debrief.reload.feedback, @debrief.feedback_comment]
  end

  test 'does not let others rate a debrief they did not request' do
    sign_in users(:event_responsible)

    patch track_debrief_feedback_path(@track, @debrief), params: { feedback: { feedback: 'up' } }

    assert_response :forbidden
    assert_nil @debrief.reload.feedback
  end
end
