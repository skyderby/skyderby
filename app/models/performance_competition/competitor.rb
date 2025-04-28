class PerformanceCompetition::Competitor < ApplicationRecord
  include EventOngoingValidation, CompetitorCountry, PerformanceCompetition::Namespace

  belongs_to :event, class_name: 'PerformanceCompetition', touch: true
  belongs_to :section
  belongs_to :profile
  belongs_to :suit
  belongs_to :team, optional: true

  has_many :results, dependent: :restrict_with_error
  has_many :reference_point_assignments, dependent: :delete_all

  accepts_nested_attributes_for :profile

  delegate :name, to: :profile, allow_nil: true
  delegate :name, to: :suit, prefix: true, allow_nil: true
  delegate :place, to: :event

  def profile_attributes=(attrs)
    attrs[:id] = profile_id if profile && profile.owner == event
    attrs[:owner] = event

    super(attrs)
  end
end
