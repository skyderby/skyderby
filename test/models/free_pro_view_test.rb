require 'test_helper'

class FreeProViewTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  setup do
    @user = users(:regular_user)
    @fresh = tracks(:hellesylt)
    @prior1 = tracks(:track_with_video)
    @prior2 = tracks(:speed_skydiving_track)

    [@fresh, @prior1, @prior2].each do |track|
      track.update_columns(owner_type: 'User', owner_id: @user.id)
    end
    @prior1.update_columns(created_at: 2.days.ago)
    @prior2.update_columns(created_at: 2.days.ago)
    @fresh.update_columns(created_at: Time.current)
  end

  test '.grant_first_look grants for an eligible returning uploader' do
    record = FreeProView.grant_first_look(user: @user, track: @fresh)

    assert_predicate record, :persisted?
    assert_predicate record, :first_look?
    assert_equal @fresh, record.track
  end

  test '.grant_first_look does not count against the monthly limit' do
    FreeProView.grant_first_look(user: @user, track: @fresh)

    assert_equal 0, FreeProView.monthly_usage_for(@user)
    assert_equal 5, FreeProView.remaining_for(@user)
  end

  test '.grant_first_look denied with fewer than two prior uploads' do
    @prior2.update_columns(owner_type: nil, owner_id: nil)

    assert_nil FreeProView.grant_first_look(user: @user, track: @fresh)
  end

  test '.grant_first_look denied when another track was uploaded earlier today' do
    @prior1.update_columns(created_at: Time.current.beginning_of_day + 1.hour)

    assert_nil FreeProView.grant_first_look(user: @user, track: @fresh)
  end

  test '.grant_first_look denied when the user already had any Pro View' do
    FreeProView.create!(user: @user, track: @prior1)

    assert_nil FreeProView.grant_first_look(user: @user, track: @fresh)
  end

  test '.grant_first_look denied for a subscriber' do
    subscriber = users(:admin)
    [@fresh, @prior1, @prior2].each do |track|
      track.update_columns(owner_type: 'User', owner_id: subscriber.id)
    end

    assert_nil FreeProView.grant_first_look(user: subscriber, track: @fresh)
  end

  test 'deleting the track keeps the consumed view against the monthly limit' do
    track = Track.create!(kind: :base, name: 'Disposable', visibility: :public_track, owner: @user)
    FreeProView.grant(user: @user, track: track)
    assert_equal 4, FreeProView.remaining_for(@user)

    track.destroy

    record = FreeProView.find_by(user: @user)
    assert_predicate record, :present?
    assert_nil record.track_id
    assert_equal 4, FreeProView.remaining_for(@user)
  end

  test 'deleting a first_look track does not restore first_look eligibility' do
    @fresh.update_columns(created_at: 2.days.ago)
    track = Track.create!(kind: :base, name: 'Disposable', visibility: :public_track, owner: @user)
    granted = FreeProView.grant_first_look(user: @user, track: track)
    assert_predicate granted, :persisted?

    track.destroy

    assert_nil FreeProView.grant_first_look(user: @user, track: @fresh)
  end

  test '#track_amplitude_events fires the first_look event for a first_look grant' do
    record = FreeProView.grant_first_look(user: @user, track: @fresh)

    assert_enqueued_with(job: AmplitudeTrackingJob) { record.track_amplitude_events }
    assert_includes enqueued_jobs.last[:args].to_s, 'pro_view_first_look_granted'
  end

  test '#track_amplitude_events fires the activated event for a regular grant' do
    FreeProView.grant(user: @user, track: @fresh)
    record = FreeProView.find_by(user: @user, track: @fresh)

    record.track_amplitude_events

    assert_includes enqueued_jobs.last[:args].to_s, "#{@fresh.kind}_pro_view_activated"
  end
end
