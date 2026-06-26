class SpeedSkydivingCompetition::Competitor < ApplicationRecord
  include EventOngoingValidation, CompetitorCountry, CompetitorAlias

  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :competitors, touch: true
  belongs_to :category
  belongs_to :profile
  belongs_to :team, optional: true

  has_many :results, dependent: :restrict_with_error

  scope :ordered,
        -> { left_joins(:profile, :competitor_alias).order(Arel.sql('COALESCE(profile_aliases.name, profiles.name)')) }

  accepts_nested_attributes_for :profile

  def profile_attributes=(attrs)
    attrs[:id] = profile_id if profile && profile.owner == event
    attrs[:owner] = event
    attrs[:require_country] = attrs[:id].blank? && attrs.key?(:country_id)

    super(attrs)
  end
end
