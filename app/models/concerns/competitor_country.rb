module CompetitorCountry
  extend ActiveSupport::Concern

  included do
    delegate :country_id, to: :profile, allow_nil: true
  end

  def country_code
    return profile.country_code unless russia_restricted?

    profile.country_code == 'RUS' ? 'RPF' : profile.country_code
  end

  def country_name
    return profile.country_name unless russia_restricted?

    profile.country_code == 'RUS' ? 'Neutral Athletes' : profile.country_name
  end

  def russia_restricted? = event.is_official && [2020, 2021].include?(event.starts_at.year)
end
