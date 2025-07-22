class PerformanceCompetition::Team < ApplicationRecord
  self.table_name = :event_teams

  belongs_to :event, class_name: 'PerformanceCompetition', inverse_of: :teams
  has_many :competitors, dependent: :nullify

  scope :ordered, -> { order(:name) }

  validates :name, presence: true
end
