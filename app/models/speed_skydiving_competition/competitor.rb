class SpeedSkydivingCompetition::Competitor < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :competitors, touch: true
  belongs_to :category
  belongs_to :profile
  belongs_to :team, optional: true

  accepts_nested_attributes_for :profile, reject_if: :profile
end
