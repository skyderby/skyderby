class SpeedSkydivingCompetition::Category < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :categories
  has_many :competitors,
           class_name: 'SpeedSkydivingCompetition::Competitor',
           inverse_of: :category,
           dependent: :restrict_with_error

  validates :name, presence: true

  before_create :set_position

  private

  def set_position
    self.position = last_position_within_event + 1
  end

  def last_position_within_event = event.categories.maximum(:position) || 0
end
