require 'test_helper'

module Profiles
  class DashboardTest < ActiveSupport::TestCase
    test 'default_mode picks the dominant kind among recent tracks' do
      profile = profiles(:alex)
      create_tracks(profile, kind: :skydive, count: 3, starting: 10.days.ago)
      create_tracks(profile, kind: :base, count: 7, starting: 1.day.ago)

      dashboard = Dashboard.new(profile)

      assert_equal :base, dashboard.current_mode
    end

    test 'default_mode falls back to mode order on a tie' do
      profile = profiles(:alex)
      create_tracks(profile, kind: :base, count: 2, starting: 5.days.ago)
      create_tracks(profile, kind: :skydive, count: 2, starting: 1.day.ago)

      dashboard = Dashboard.new(profile)

      assert_equal :performance, dashboard.current_mode
    end

    test 'requested mode still wins over the recent-tracks default' do
      profile = profiles(:alex)
      create_tracks(profile, kind: :base, count: 5, starting: 1.day.ago)
      create_tracks(profile, kind: :skydive, count: 1, starting: 10.days.ago)

      dashboard = Dashboard.new(profile, mode: 'performance')

      assert_equal :performance, dashboard.current_mode
    end

    private

    def create_tracks(profile, kind:, count:, starting:)
      count.times do |index|
        Track.create!(
          pilot: profile,
          place: places(:hellesylt),
          suit: suits(:apache),
          kind: kind,
          visibility: :public_track,
          recorded_at: starting + index.minutes
        )
      end
    end
  end
end
