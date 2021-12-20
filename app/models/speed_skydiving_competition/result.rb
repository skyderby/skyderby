class SpeedSkydivingCompetition::Result < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :rounds
  belongs_to :competitor
  belongs_to :round
  belongs_to :track

  has_many :penalties, class_name: 'SpeedSkydivingCompetition::Result::Penalty', dependent: :destroy
end
