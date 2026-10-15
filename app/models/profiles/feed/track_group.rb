module Profiles
  class Feed
    class TrackGroup
      PREVIEW_LIMIT = 3

      attr_reader :profile, :date, :tracks

      def initialize(profile:, date:, tracks:)
        @profile = profile
        @date = date
        @tracks = tracks
      end

      def sort_time = tracks.map(&:created_at).max

      def kinds = tracks.map(&:kind).uniq

      def place_names = tracks.filter_map(&:place_name).uniq

      def preview = tracks.sort_by(&:recorded_at).reverse.first(PREVIEW_LIMIT)

      def more_count = tracks.size - preview.size
    end
  end
end
