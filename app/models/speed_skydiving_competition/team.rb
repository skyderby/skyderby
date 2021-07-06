class SpeedSkydivingCompetition::Team < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :categories
  has_many :competitors, class_name: 'SpeedSkydivingCompetition::Competitor', dependent: :nullify

  validates :name, presence: true
end
