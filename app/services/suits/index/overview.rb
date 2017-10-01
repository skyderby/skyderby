module Suits
  module Index
    class Overview
      include ManufacturerCategories

      def overview?
        true
      end

      def manufacturer
        nil
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

      def suits_popularity_query
        @suits_popularity_query ||=
          Wingsuit
          .joins(:manufacturer)
          .joins("INNER JOIN (#{tracks_query}) AS tracks ON tracks.wingsuit_id = wingsuits.id")
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
        Track.where('recorded_at > ?', 1.year.ago.beginning_of_day)
             .where.not(wingsuit_id: nil, profile_id: nil)
             .select('count(distinct profile_id) as count', :wingsuit_id)
             .group(:wingsuit_id)
             .to_sql
      end
    end
  end
end
