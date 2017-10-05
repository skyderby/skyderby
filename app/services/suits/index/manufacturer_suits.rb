module Suits
  module Index
    class ManufacturerSuits
      include ManufacturerCategories

      def initialize(manufacturer_id)
        @manufacturer_id = manufacturer_id
      end

      def overview?
        false
      end

      def manufacturer
        @manufacturer ||= Manufacturer.find(manufacturer_id)
      end

      def wingsuits
        @wingsuits ||= suits.select(&:wingsuit?)
      end

      def tracksuits
        @tracksuits ||= suits.select(&:tracksuit?)
      end

      def monotracks
        @monotracks ||= suits.select(&:monotrack?)
      end

      def slicks
        @slicks ||= suits.select(&:slick?)
      end

      private

      def suits
        @suits ||=
          manufacturer
          .suits
          .joins(tracks_count_query)
          .select(
            :id,
            :name,
            :kind,
            'COALESCE(tracks.base_tracks, 0) AS base_tracks',
            'COALESCE(tracks.skydive_tracks, 0) AS skydive_tracks',
            'COALESCE(tracks.profiles, 0) AS profiles'
          )
          .order(:name)
          .to_a
      end

      def tracks_count_query
        tracks_select =
          Track
          .where.not(suit: nil)
          .select(
            "SUM(CASE WHEN kind = #{Track.kinds[:skydive]} THEN 1 ELSE 0 END) AS skydive_tracks",
            "SUM(CASE WHEN kind = #{Track.kinds[:base]} THEN 1 ELSE 0 END) AS base_tracks",
            'COUNT(DISTINCT profile_id) AS profiles',
            :suit_id
          )
          .group(:suit_id)
          .to_sql

        "LEFT OUTER JOIN (#{tracks_select}) AS tracks ON tracks.suit_id = suits.id"
      end

      attr_reader :manufacturer_id
    end
  end
end
