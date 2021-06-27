class SpeedSkydivingCompetition::Team < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :categories

  validates :name, presence: true
end
