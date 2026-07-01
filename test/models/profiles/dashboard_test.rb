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

    test 'live_competitions returns published or surprise events started within the last two weeks' do
      responsible = users(:event_responsible)
      place = places(:hellesylt)
      base = { range_from: 3000, range_to: 2000, responsible: responsible, place: place }

      PerformanceCompetition.create!(name: 'Live Cup', starts_at: 3.days.ago, status: :published, **base)
      PerformanceCompetition.create!(name: 'Surprise Cup', starts_at: 1.day.ago, status: :surprise, **base)
      PerformanceCompetition.create!(name: 'Old Cup', starts_at: 3.weeks.ago, status: :published, **base)
      PerformanceCompetition.create!(name: 'Future Cup', starts_at: 3.days.from_now, status: :published, **base)
      PerformanceCompetition.create!(name: 'Draft Cup', starts_at: 2.days.ago, status: :draft, **base)

      names = Dashboard.new(profiles(:alex)).live_competitions.map { |entry| entry.event.name }

      assert_equal ['Surprise Cup', 'Live Cup'], names
    end

    test 'live_competitions exposes location and athletes count' do
      responsible = users(:event_responsible)
      place = places(:hellesylt)
      event = PerformanceCompetition.create!(
        name: 'Live Cup', range_from: 3000, range_to: 2000,
        responsible: responsible, place: place, starts_at: 1.day.ago, status: :published
      )
      category = event.categories.create!(name: 'Open')
      event.competitors.create!(name: 'Pilot One', category: category,
                                profile: profiles(:john), suit: suits(:apache))

      entry = Dashboard.new(profiles(:alex)).live_competitions.first

      assert_equal place.name, entry.location
      assert_equal 1, entry.athletes_count
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
