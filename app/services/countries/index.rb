module Countries
  class Index
    delegate :each, to: :countries

    def top_by_tracks
      @top_by_tracks ||= begin
        tracks_query =
          Track
          .joins(place: :country)
          .select('count(tracks.id) AS count', 'countries.id AS country_id')
          .group('countries.id')
          .to_sql

        Country
          .joins("LEFT OUTER JOIN (#{tracks_query}) tracks_stats ON tracks_stats.country_id = countries.id")
          .select(:id, :name, 'tracks_stats.count AS tracks_count')
          .order('tracks_count desc NULLS LAST')
          .limit(10)
      end
    end

    def top_by_profiles
      @top_by_profiles ||= begin
        profiles_query =
          Profile
          .joins(:country)
          .select('count(profiles.id) AS count', 'countries.id AS country_id')
          .group('countries.id')
          .to_sql

        Country
          .joins("LEFT OUTER JOIN (#{profiles_query}) profiles_stats ON profiles_stats.country_id = countries.id")
          .select(:id, :name, 'profiles_stats.count AS profiles_count')
          .order('profiles_count desc NULLS LAST')
          .limit(10)
      end
    end

    def countries
      @countries ||= Country.order(:name)
    end
  end
end
