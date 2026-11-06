require 'test_helper'

class Tracks::ComparisonsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    @owner = users(:regular_user)
    @track = skydive_track(profiles(:regular_user))
    @track.update!(owner: @owner)
    @other = skydive_track(Profile.create!(name: 'Other Pilot'))
  end

  test 'asks in a modal what to compare' do
    sign_in users(:admin)

    get new_track_comparison_path(@track, other_track_id: @other.id, from: 2500, to: 1500), as: :turbo_stream

    assert_response :success
    assert_select 'input[type=radio][name=focus]', 4
    assert_select 'input[type=radio][name=focus][value=time]'
    assert_select 'input[type=hidden][name=from][value=?]', '2500'
  end

  test 'explains the difference between two jumps in the window from the screen' do
    sign_in users(:admin)

    assert_enqueued_with(job: DebriefJob) do
      post track_comparisons_path(@track), params: { other_track_id: @other.id, from: 2500, to: 1500 }
    end

    debrief = @track.debriefs.last
    assert_redirected_to track_debrief_path(@track, debrief)
    assert_equal [@other, users(:admin), 'comparison'], [debrief.other_track, debrief.user, debrief.strategy]
    assert_equal({ 'other_track_id' => @other.id, 'focus' => 'distance', 'from' => 2500, 'to' => 1500 },
                 debrief.inputs['comparison'])
    assert_equal 2500, debrief.inputs.dig('jump', 'metrics', 'window', 'from_altitude')
    assert_predicate debrief.evidence.dig('tracks', @other.id.to_s, 'metrics', 'window', 'segments'), :present?
  end

  test 'measures and briefs the comparison on the chosen performance task' do
    comparison = Track::Debrief::Comparison.new(@track, @other, from: 2500, to: 1500, focus: 'time')
    debrief = Track::Debrief.new(track: @track, user: users(:admin), other_track: @other, inputs: comparison.inputs,
                                 evidence: comparison.evidence)
    window = comparison.inputs.dig('jump', 'metrics', 'window')

    assert_equal "comparison-time-#{@other.id}-2500-1500", comparison.key
    assert_in_delta window['duration'], window['result'], 0.2
    assert_includes Track::Debrief::ComparisonPrompt.new(debrief).system, 'The pilot asks about time'
  end

  test 'compares the flares of two jumps when the pilot picks the flare' do
    sign_in users(:admin)
    jump = flare_track(profiles(:regular_user))
    other = flare_track(Profile.create!(name: 'Flare Pilot'))

    post track_comparisons_path(jump), params: { other_track_id: other.id, focus: 'flare', from: 2500, to: 1500 }

    debrief = jump.debriefs.last
    prompt = Track::Debrief::ComparisonPrompt.new(debrief)
    assert_equal "comparison-flare-#{other.id}", debrief.discipline_key
    assert_equal({ 'other_track_id' => other.id, 'focus' => 'flare' }, debrief.inputs['comparison'])
    assert debrief.inputs.dig('jump', 'metrics', 'flare', 'gain')
    assert_includes prompt.system, '<replay phase="flare"'
    assert_includes prompt.system, 'flare_potential'
    assert_includes prompt.user_message, 'Flare series'
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

  def flare_track(pilot)
    create_track_from_file('WBR/Yegor_16_Round3.CSV', kind: :base, suit: suits(:apache), pilot:).tap do |track|
      track.update!(ff_end: 49)
    end
  end

  def skydive_track(pilot)
    place = Place.find_by(name: 'Ravenna') || create(:place, name: 'Ravenna', msl: 0)
    create_track_from_file('13-31-51_Ravenna.CSV', place_id: place.id, kind: :skydive, suit: suits(:apache), pilot:)
  end
end
