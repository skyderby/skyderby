class Boogie::Competitor < ApplicationRecord
  include EventOngoingValidation, CompetitorCountry

  belongs_to :event, class_name: 'Boogie', touch: true
  belongs_to :section
  belongs_to :profile
  belongs_to :suit
  belongs_to :team, optional: true

  has_many :results, dependent: :restrict_with_error
  has_many :reference_point_assignments, dependent: :delete_all

  delegate :name, to: :profile, allow_nil: true
  delegate :name, to: :suit, prefix: true, allow_nil: true
  delegate :place, to: :event
end
