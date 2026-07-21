module Events
  class MetaTags < SimpleDelegator
    SPORTS = {
      'Tournament' => 'BASE Race',
      'PerformanceCompetition' => 'Wingsuit performance flying',
      'SpeedSkydivingCompetition' => 'Speed skydiving',
      'Boogie' => 'Tracking competition'
    }.freeze

    def initialize(event, url: nil)
      super(event)
      @url = url
    end

    attr_reader :url
    alias canonical_url url

    def indexable?
      public_event? && !draft? && !surprise?
    end

    def sport
      SPORTS.fetch(__getobj__.class.name)
    end

    def description
      [headline, participants, I18n.t('meta.events.cta')].compact_blank.join(' ')
    end

    def structured_data
      {
        '@context' => 'https://schema.org',
        '@type' => 'SportsEvent',
        'name' => name,
        'sport' => sport,
        'url' => url,
        'startDate' => starts_at&.iso8601,
        'eventStatus' => 'https://schema.org/EventScheduled',
        'description' => description,
        'location' => structured_location,
        'organizer' => structured_organizers
      }.compact
    end

    private

    def headline
      key = location.present? ? 'meta.events.headline_with_place' : 'meta.events.headline'
      I18n.t(key, sport:, location:, date:)
    end

    def participants
      count = competitors.count
      return if count.zero?

      competitors_phrase = I18n.t('meta.events.competitors', count:)
      countries = countries_count
      return I18n.t('meta.events.participants_only', competitors: competitors_phrase) if countries.zero?

      I18n.t('meta.events.participants',
             competitors: competitors_phrase,
             countries: I18n.t('meta.events.countries', count: countries))
    end

    def countries_count
      competitors.joins(:profile).where.not(profiles: { country_id: nil })
                 .distinct.count('profiles.country_id')
    end

    def location
      return if place.blank?

      [place.name, place.country_name].compact_blank.join(', ')
    end

    def date
      starts_at&.strftime('%B %-d, %Y')
    end

    def structured_location
      return if place.blank?

      {
        '@type' => 'Place',
        'name' => place.name,
        'address' => structured_address,
        'geo' => structured_geo
      }.compact
    end

    def structured_address
      return if place.country_name.blank?

      { '@type' => 'PostalAddress', 'addressCountry' => place.country_name }
    end

    def structured_geo
      return if place.latitude.blank? || place.longitude.blank?

      {
        '@type' => 'GeoCoordinates',
        'latitude' => place.latitude.to_f,
        'longitude' => place.longitude.to_f
      }
    end

    def structured_organizers
      names = organizers.map(&:name).compact_blank
      return if names.empty?

      names.map { |organizer_name| { '@type' => 'Person', 'name' => organizer_name } }
    end
  end
end
