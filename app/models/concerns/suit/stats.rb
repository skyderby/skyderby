class Suit < ApplicationRecord
  module Stats
    extend ActiveSupport::Concern

    class_methods do
      def stats
        joins("LEFT OUTER JOIN (#{stats_from_tracks_query}) AS tracks ON tracks.suit_id = suits.id")
          .select(
            :id,
            'COALESCE(tracks.base_tracks, 0) AS base_tracks',
            'COALESCE(tracks.skydive_tracks, 0) AS skydive_tracks',
            'COALESCE(tracks.profiles, 0) AS profiles'
          )
      end

      def stats_from_tracks_query
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
      end
    end
  end
end
