class SpeedSkydivingCompetition::Category < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :categories
  has_many :competitors,
           class_name: 'SpeedSkydivingCompetition::Competitor',
           inverse_of: :category,
           dependent: :restrict_with_error

  validates :name, presence: true
end
