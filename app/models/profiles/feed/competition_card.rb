module Profiles
  class Feed
    class CompetitionCard
      Standing = Data.define(:profile, :rank, :total, :unit)
      LIVE_PERIOD = 2.weeks
      PODIUM_SIZE = 3

      attr_reader :event

      def initialize(event:, profile_ids:, user:)
        @event = event
        @profile_ids = profile_ids
        @user = user
      end

      def date = event.starts_at

      def sort_time = event.starts_at.end_of_day

      def live? = (event.published? || event.surprise?) && event.starts_at >= LIVE_PERIOD.ago.to_date

      def results_hidden? = event.surprise? && !event.editable?(user)

      def athletes_count = @athletes_count ||= event.competitors.count

      def podium = open_standings.first(PODIUM_SIZE)

      def followed_standings = open_standings.drop(PODIUM_SIZE).select { |standing| followed?(standing.profile.id) }

      def followed_without_results
        ranked_ids = open_standings.map { |standing| standing.profile.id }
        followed_profiles.reject { |profile| ranked_ids.include?(profile.id) }
      end

      def followed?(profile_id) = followed_profiles.any? { |profile| profile.id == profile_id }

      private

      attr_reader :profile_ids, :user

      def followed_profiles
        @followed_profiles ||=
          Profile.where(id: event.competitors.where(profile_id: profile_ids).select(:profile_id))
                 .includes(userpic_attachment: :blob)
                 .order(:name)
                 .to_a
      end

      def open_standings
        @open_standings ||= results_hidden? ? [] : scored(standings).sort_by(&:rank)
      end

      def scored(standings) = standings.select { |standing| standing.rank && standing.total.to_f.positive? }

      def standings
        case event
        when PerformanceCompetition then performance_standings
        when SpeedSkydivingCompetition then speed_standings
        when Boogie then boogie_standings
        when Tournament then qualification_standings
        end
      end

      def performance_standings
        event.open_standings.standings.rows.map do |row|
          Standing.new(profile: row.competitor.profile, rank: row.rank, total: row.total_points, unit: :points)
        end
      end

      def speed_standings
        event.open_standings.rows.map do |row|
          Standing.new(profile: row[:competitor].profile, rank: row[:rank], total: row[:total], unit: :kmh)
        end
      end

      def boogie_standings
        event.standings.categories.values.flat_map(&:rows)
             .group_by { |row| row.competitor.profile_id }
             .map { |_profile_id, rows| rows.max_by { |row| row.total_points.to_f } }
             .sort_by { |row| -row.total_points.to_f }
             .each_with_index.map do |row, index|
               Standing.new(profile: row.competitor.profile, rank: index + 1, total: row.total_points, unit: :points)
             end
      end

      def qualification_standings
        return [] unless event.has_qualification

        Tournament::Qualification::Scoreboard.new(event).competitors.map do |row|
          Standing.new(profile: row.profile, rank: row.rank, total: row.best_result, unit: :seconds)
        end
      end
    end
  end
end
