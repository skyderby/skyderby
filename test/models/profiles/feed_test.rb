require 'test_helper'

module Profiles
  class FeedTest < ActiveSupport::TestCase
    setup do
      @user = users(:admin)
      @followed = profiles(:regular_user)
      @followed.follow(user: @user)
    end

    test 'groups public tracks of followed pilots by pilot and upload day' do
      feed = Feed.new(@user)

      group = feed.items.grep(Feed::TrackGroup).find { |item| item.profile == @followed }

      assert_equal Track.where(pilot: @followed).count, group.tracks.size
      assert_equal Time.zone.today, group.date
    end

    test 'skips unlisted tracks of followed pilots and tracks of others' do
      tracks(:hellesylt).update!(visibility: :unlisted_track)

      track_ids = Feed.new(@user).items.grep(Feed::TrackGroup).flat_map(&:tracks).map(&:id)

      assert_not_includes track_ids, tracks(:hellesylt).id
      assert_not_includes track_ids, tracks(:boogie_track_1).id
    end

    test 'includes own private tracks' do
      own = tracks(:boogie_track_5)
      own.update!(pilot: profiles(:admin), visibility: :private_track)

      track_ids = Feed.new(@user).items.grep(Feed::TrackGroup).flat_map(&:tracks).map(&:id)

      assert_includes track_ids, own.id
    end

    test 'shows open competitions with followed participants' do
      event = events(:nationals)
      event.update!(starts_at: Time.zone.today)
      profiles(:john).follow(user: @user)

      card = Feed.new(@user).items.grep(Feed::CompetitionCard).find { |item| item.event == event }

      assert card.followed?(profiles(:john).id)
      assert_includes card.podium.map(&:profile) + card.followed_without_results, profiles(:john)
    end

    test 'shows competitions nobody followed takes part in' do
      event = events(:nationals)
      event.update!(starts_at: Time.zone.today)

      card = Feed.new(@user).items.grep(Feed::CompetitionCard).find { |item| item.event == event }

      assert_empty card.followed_standings
      assert_empty card.followed_without_results
    end

    test 'skips draft and private competitions' do
      events(:nationals).update!(starts_at: Time.zone.today, status: :draft)
      events(:boogie).update!(starts_at: Time.zone.today, visibility: :private_event)

      events = Feed.new(@user).items.grep(Feed::CompetitionCard).map(&:event)

      assert_not_includes events, events(:nationals)
      assert_not_includes events, events(:boogie)
    end

    test 'hides results of surprise competitions' do
      event = events(:nationals)
      event.update!(starts_at: Time.zone.today, status: :surprise)
      profiles(:john).follow(user: users(:regular_user))

      card = Feed.new(users(:regular_user)).items.grep(Feed::CompetitionCard).find { |item| item.event == event }

      assert_empty card.podium
      assert_equal [profiles(:john)], card.followed_without_results
    end

    test 'points to the latest older activity for the next page' do
      Track.where(pilot: @followed).update_all(created_at: 3.months.ago)

      feed = Feed.new(@user)

      assert_equal 3.months.ago.to_date, feed.older_until_date
    end

    test 'shows top ten entries of followed pilots with their current rank' do
      entry = ranking_entry

      card = Feed.new(@user).items.grep(Feed::RankingCard).sole

      assert_equal([[@followed, 1]], card.rows.map { [it.profile, it.rank] })
      assert_equal entry.virtual_competition, card.competition
    end

    test 'shows top ten entries of favorite rankings' do
      entry = ranking_entry
      Profile::Follow.delete_all
      entry.virtual_competition.favorite(user: @user)

      assert_equal 1, Feed.new(@user).items.grep(Feed::RankingCard).size
    end

    test 'drops top ten entries whose results were removed by moderation' do
      entry = ranking_entry
      entry.track.update!(disqualified_from_online_competitions: true)
      entry.track.delete_online_competitions_results

      assert_empty Feed.new(@user).items.grep(Feed::RankingCard)
    end

    private

    def ranking_entry
      competition = virtual_competitions(:distance_in_time)
      competition.update!(period_to: nil)
      track = tracks(:hellesylt)
      track.update!(recorded_at: Time.current)
      competition.results.create!(track:, result: 2000)
      VirtualCompetition::TopEntry.record(track)
      VirtualCompetition::TopEntry.last
    end
  end
end
