require 'test_helper'

class Tracks::ComparisonsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    @owner = users(:regular_user)
    @track = skydive_track(profiles(:regular_user))
    @track.update!(owner: @owner)
    @other = skydive_track(Profile.create!(name: 'Other Pilot'))
  end

  test 'explains the difference between two jumps in the window from the screen' do
    sign_in users(:admin)

    assert_enqueued_with(job: DebriefJob) do
      post track_comparisons_path(@track), params: { other_track_id: @other.id, from: 2500, to: 1500 }
    end

    debrief = @track.debriefs.last
    assert_redirected_to track_debrief_path(@track, debrief)
    assert_equal [@other, users(:admin), 'comparison'], [debrief.other_track, debrief.user, debrief.strategy]
    assert_equal({ 'other_track_id' => @other.id, 'from' => 2500, 'to' => 1500 }, debrief.inputs['comparison'])
    assert_equal 2500, debrief.inputs.dig('jump', 'metrics', 'window', 'from_altitude')
    assert_predicate debrief.evidence.dig('tracks', @other.id.to_s, 'metrics', 'window', 'segments'), :present?
  end

  test 'is admin only while debriefs are in preview' do
    sign_in @owner

    post track_comparisons_path(@track), params: { other_track_id: @other.id, from: 2500, to: 1500 }

    assert_response :forbidden
  end

  test 'rejects an empty window' do
    sign_in users(:admin)

    post track_comparisons_path(@track), params: { other_track_id: @other.id, from: 1500, to: 2500 }

    assert_response :unprocessable_content
  end

  test 'writes to the pilot about their own jump and in the third person to anyone else' do
    comparison = Track::Debrief::Comparison.new(@track, @other, from: 2500, to: 1500)
    own = Track::Debrief.new(track: @track, user: @owner, other_track: @other, inputs: comparison.inputs,
                             evidence: comparison.evidence)
    other_reader = Track::Debrief.new(track: @track, user: users(:event_responsible), other_track: @other,
                                      inputs: comparison.inputs, evidence: comparison.evidence)

    own_prompt = Track::Debrief::ComparisonPrompt.new(own)

    assert_includes own_prompt.system, 'from 2500 to 1500 m'
    assert_includes own_prompt.system, %(with="track:#{@other.id}")
    assert_not_includes own_prompt.system, 'third person'
    assert_includes Track::Debrief::ComparisonPrompt.new(other_reader).system, 'third person'
    assert_includes own_prompt.user_message, %("track:#{@other.id}")
  end

  private

  def skydive_track(pilot)
    place = Place.find_by(name: 'Ravenna') || create(:place, name: 'Ravenna', msl: 0)
    create_track_from_file('13-31-51_Ravenna.CSV', place_id: place.id, kind: :skydive, suit: suits(:apache), pilot:)
  end
end
