require 'test_helper'

class FreeProViewsSummaryTest < ActiveSupport::TestCase
  setup do
    @user = users(:regular_user)
  end

  test '#days_to_reset returns days until next month' do
    summary = FreeProViewsSummary.new(@user)

    expected = (Date.current.next_month.beginning_of_month - Date.current).to_i
    assert_equal expected, summary.days_to_reset
  end

  test '#views_remaining returns remaining free views' do
    summary = FreeProViewsSummary.new(@user)

    assert_equal 5, summary.views_remaining

    track = tracks(:hellesylt)
    FreeProView.create!(user: @user, track: track)

    assert_equal 4, summary.views_remaining
  end

  test '#track_ids returns track ids from current month' do
    track1 = tracks(:hellesylt)
    track2 = tracks(:track_with_video)

    FreeProView.create!(user: @user, track: track1)
    FreeProView.create!(user: @user, track: track2)

    summary = FreeProViewsSummary.new(@user)

    assert_includes summary.track_ids, track1.id
    assert_includes summary.track_ids, track2.id
  end

  test '#unique_months counts distinct months' do
    track = tracks(:hellesylt)
    FreeProView.create!(user: @user, track: track)

    summary = FreeProViewsSummary.new(@user)

    assert_equal 1, summary.unique_months
  end

  test '#own_tracks_ratio calculates ratio of own tracks' do
    own_track = tracks(:hellesylt)
    own_track.update!(pilot: @user.profile)

    other_track = tracks(:track_with_video)
    other_track.update!(pilot: profiles(:alex))

    FreeProView.create!(user: @user, track: own_track)
    FreeProView.create!(user: @user, track: other_track)

    summary = FreeProViewsSummary.new(@user)

    assert_equal 0.5, summary.own_tracks_ratio
  end

  test '#own_tracks_ratio returns 0 when no views' do
    summary = FreeProViewsSummary.new(@user)

    assert_equal 0.0, summary.own_tracks_ratio
  end
end
