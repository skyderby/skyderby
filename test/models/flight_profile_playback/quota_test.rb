require 'test_helper'

class FlightProfilePlayback::QuotaTest < ActiveSupport::TestCase
  setup do
    @user = users(:regular_user)
    @quota = FlightProfilePlayback::Quota.new(@user)
    @tracks = tracks(:hellesylt, :boogie_track_1, :boogie_track_2, :boogie_track_3, :boogie_track_4, :boogie_track_5)
  end

  test 'counts distinct tracks once per month' do
    assert_equal :granted, @quota.grant([@tracks[0].id, @tracks[1].id])
    assert_equal :already, @quota.grant([@tracks[0].id.to_s])

    assert_equal 2, FlightProfilePlayback.where(user: @user).count
    assert_equal 3, @quota.remaining
  end

  test 'refuses the whole request when new tracks exceed the remaining quota' do
    assert_equal :granted, @quota.grant(@tracks.first(4).map(&:id))

    assert_no_difference -> { FlightProfilePlayback.count } do
      assert_equal :limit_reached, @quota.grant(@tracks.last(2).map(&:id))
    end
    assert_equal 1, @quota.remaining
  end

  test 'replaying counted tracks stays free after the limit is used' do
    @quota.grant(@tracks.first(5).map(&:id))

    assert_equal 0, @quota.remaining
    assert_equal :already, @quota.grant([@tracks.first.id])
    assert_equal :limit_reached, @quota.grant([@tracks.last.id])
  end

  test 'previous months do not count' do
    FlightProfilePlayback.create!(user: @user, track: @tracks.first, month: 1.month.ago.to_date.beginning_of_month)

    assert_equal 5, @quota.remaining
    assert_equal :granted, @quota.grant([@tracks.first.id])
  end

  test 'ignores unknown and malformed track ids' do
    assert_equal :already, @quota.grant([0, 'abc', { 'a' => 'b' }])
    assert_equal 0, FlightProfilePlayback.count
  end

  test 'does not count tracks the user cannot view' do
    private_track = @tracks.first
    private_track.update_columns(visibility: Track.visibilities[:private_track], profile_id: profiles(:admin).id)

    assert_equal :already, @quota.grant([private_track.id])
    assert_equal 0, FlightProfilePlayback.count
  end

  test 'subscribers are unlimited and not recorded' do
    quota = FlightProfilePlayback::Quota.new(users(:admin))

    assert_predicate quota, :unlimited?
    assert_equal :subscriber, quota.grant(@tracks.map(&:id))
    assert_equal 0, FlightProfilePlayback.count
  end

  test 'guests need an account' do
    quota = FlightProfilePlayback::Quota.new(GuestUser.new({}))

    assert_equal :sign_in_required, quota.grant([@tracks.first.id])
  end
end
