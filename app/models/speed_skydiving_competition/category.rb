class SpeedSkydivingCompetition::Category < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :categories

  validates :name, presence: true
end
