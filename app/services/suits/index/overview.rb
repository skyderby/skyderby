module Suits
  module Index
    class Overview
      include ManufacturerCategories

      def initialize(params)
        @params = params
      end

      def overview?
        true
      end

      def manufacturer
        nil
      end

      def filter_by_activity?
        params[:activity].present?
      end

      def skydive?
        params[:activity] == 'skydive'
      end

      def base?
        params[:activity] == 'base'
      end

      def suits_popularity
        suits_popularity_query.map do |record|
          {
            manufacturer_name: record.q_manufacturer_name,
            name: record.name,
            y: record.popularity.to_f
          }
        end
      end

      private

      attr_reader :params

      def suits_popularity_query
        @suits_popularity_query ||=
          Suit
          .joins(:manufacturer)
          .joins("INNER JOIN (#{tracks_query}) AS tracks ON tracks.suit_id = suits.id")
          .select(
            :id,
            :name,
            :manufacturer_id,
            'manufacturers.name AS q_manufacturer_name',
            'round(tracks.count::numeric / sum(tracks.count) OVER () * 100, 2) AS popularity'
          )
          .group(:id, :name, :manufacturer_id, 'q_manufacturer_name', 'tracks.count')
          .order('popularity desc')
      end

      def tracks_query
        scope =
          Track
          .where('recorded_at > ?', 1.year.ago.beginning_of_day)
          .where('suit_id IS NOT NULL AND profile_id IS NOT NULL')
          .select('count(distinct profile_id) as count', :suit_id)
          .group(:suit_id)

        if filter_by_activity?
          scope = scope.skydive if skydive?
          scope = scope.base if base?
        end

        scope.to_sql
      end
    end
  end
end
