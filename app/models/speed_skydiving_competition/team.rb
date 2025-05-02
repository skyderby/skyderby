class SpeedSkydivingCompetition::Team < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :teams
  has_many :competitors, class_name: 'SpeedSkydivingCompetition::Competitor', dependent: :nullify

  scope :ordered, -> { order(:name) }

  validates :name, presence: true
end
