module Profiles
  class Feed
    class RankingCard
      Row = Data.define(:profile, :rank, :result, :track)

      attr_reader :competition, :date, :year

      def initialize(competition:, date:, year:, entries:)
        @competition = competition
        @date = date
        @year = year
        @entries = entries
      end

      def sort_time = entries.map(&:entered_at).max

      def rows
        @rows ||= entries.filter_map { |entry| row(entry) }.sort_by(&:rank)
      end

      delegate :empty?, to: :rows

      private

      attr_reader :entries

      def row(entry)
        standing = standings[entry.track_id]
        return unless standing && entry.track.public_track?

        Row.new(profile: entry.profile, rank: standing.rank, result: standing.result, track: entry.track)
      end

      def standings
        @standings ||= competition.season_standings(year).where(track_id: entries.map(&:track_id)).index_by(&:track_id)
      end
    end
  end
end
