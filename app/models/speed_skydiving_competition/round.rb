class SpeedSkydivingCompetition::Round < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :rounds

  validates :number, presence: true
end
