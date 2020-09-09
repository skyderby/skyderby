class Suit < ApplicationRecord
  module Popularity
    extend ActiveSupport::Concern

    class_methods do
      def popularity(period_from, period_to, activity)
        tracks_query = build_tracks_query(period_from, period_to, activity)

        Suit
          .joins(:manufacturer)
          .joins("INNER JOIN (#{tracks_query}) AS tracks ON tracks.suit_id = suits.id")
          .select(
            'suits.*',
            'round(tracks.count::numeric / sum(tracks.count) OVER () * 100, 2) AS popularity'
          )
          .group(:id, :manufacturer_id, 'tracks.count')
          .order('popularity desc')
      end

      def build_tracks_query(period_from, period_to, activity)
        Track
          .where('recorded_at BETWEEN ? AND ?', period_from, period_to)
          .where.not(suit_id: nil)
          .where.not(profile_id: nil)
          .select('count(distinct profile_id) as count', :suit_id)
          .group(:suit_id)
          .then { |relation| filter_by_activity(relation, activity) }
          .to_sql
      end

      def filter_by_activity(relation, activity)
        allowed_activities = Track.kinds.keys

        return relation unless allowed_activities.include?(activity)

        relation.public_send(activity)
      end
    end
  end
end
