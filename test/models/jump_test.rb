require 'test_helper'

class JumpTest < ActiveSupport::TestCase
  setup do
    @profile = profiles(:regular_user)
    @track = tracks(:hellesylt)
    @track.update!(exited_at: Time.zone.local(2026, 5, 1, 10), recorded_at: Time.zone.local(2026, 5, 1, 10, 5))
  end

  test 'next number continues from the highest number of the same kind' do
    @profile.jumps.create!(kind: :base, number: 40, jumped_at: 1.day.ago)
    @profile.jumps.create!(kind: :skydive, number: 900, jumped_at: 1.day.ago)

    assert_equal 41, Jump.next_number(@profile, :base)
  end

  test 'deleting the track detaches the jump and marks it changed' do
    track = tracks(:boogie_track_1)
    PerformanceCompetition::Result.where(track:).delete_all
    jump = @profile.jumps.create!(jumped_at: 1.day.ago, track:)
    jump.update_columns(updated_at: 1.day.ago)

    track.destroy!

    jump.reload
    assert_nil jump.track_id
    assert_operator jump.updated_at, :>, 1.minute.ago
  end

  test 'a first track stays unnumbered' do
    assert_nil Jump.record_track(@track).number
  end

  test 'a track newer than every numbered jump gets the next number' do
    @profile.jumps.create!(kind: :base, number: 40, jumped_at: @track.exited_at - 1.day)

    assert_equal 41, Jump.record_track(@track).number
  end

  test 'a track older than the latest numbered jump stays unnumbered' do
    @profile.jumps.create!(kind: :base, number: 40, jumped_at: @track.exited_at + 1.day)

    assert_nil Jump.record_track(@track).number
  end

  test 'a track attaches to a manual jump close in time and keeps its manual values' do
    jump = @profile.jumps.create!(kind: :base, jumped_at: @track.exited_at + 10.minutes, freefall_seconds: 7)

    assert_no_difference -> { Jump.count } do
      Jump.record_track(@track)
    end

    assert_equal @track, jump.reload.track
    assert_equal 7, jump.freefall_seconds
  end

  test 'a re-uploaded track replaces the earlier one on the same jump' do
    jump = Jump.record_track(@track)
    other = tracks(:track_with_video)
    other.update!(exited_at: @track.exited_at + 20.seconds)

    assert_no_difference -> { Jump.count } do
      Jump.record_track(other)
    end

    assert_equal other, jump.reload.track
  end

  test 'speed skydiving tracks land in the skydive logbook' do
    @track.update!(kind: :speed_skydiving)

    assert_predicate Jump.record_track(@track), :skydive?
  end

  test 'renumbering numbers later jumps and leaves earlier ones alone' do
    earlier = @profile.jumps.create!(kind: :base, number: 5, jumped_at: 3.days.ago)
    anchor = @profile.jumps.create!(kind: :base, number: 10, jumped_at: 2.days.ago)
    later = @profile.jumps.create!(kind: :base, jumped_at: 1.day.ago)

    anchor.renumber_following

    assert_equal 5, earlier.reload.number
    assert_equal 11, later.reload.number
  end

  test 'discarding keeps the row, frees the track and hides the jump' do
    jump = Jump.record_track(@track)

    jump.discard

    assert_nil @track.reload.jump
    assert_predicate jump.reload.deleted_at, :present?
  end

  test 'suggests the values the pilot already used for this kind' do
    profile = profiles(:regular_user)
    profile.jumps.create!(kind: :skydive, jumped_at: 2.days.ago, aircraft: 'Cessna')
    profile.jumps.create!(kind: :skydive, jumped_at: 1.day.ago, aircraft: 'Cessna')
    profile.jumps.create!(kind: :base, jumped_at: 1.day.ago, aircraft: 'Helicopter')
    profiles(:admin).jumps.create!(kind: :skydive, jumped_at: 1.day.ago, aircraft: 'Skyvan')

    assert_equal ['Cessna'], profile.jumps.new(kind: :skydive).suggestions_for(:aircraft)
  end
end
