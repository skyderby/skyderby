class SpeedSkydivingCompetition::Category < ApplicationRecord
  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :categories
  has_many :competitors,
           class_name: 'SpeedSkydivingCompetition::Competitor',
           inverse_of: :category,
           dependent: :restrict_with_error

  scope :sorted, ->{ order(:position) }
  validates :name, presence: true

  before_create :set_position

  def move_upper
    swap_position_with previous_category
  end

  def move_lower
    swap_position_with next_category
  end

  private

  def set_position
    self.position = last_position_within_event + 1
  end

  def last_position_within_event = event.categories.maximum(:position) || 0

  def swap_position_with(other_section)
    return unless other_section

    tmp_position = position
    ActiveRecord::Base.transaction do
      update!(position: other_section.position)
      other_section.update!(position: tmp_position)
    end
  end

  def next_category = event.categories.where('position > ?', position).limit(1).order(:position).first

  def previous_category = event.categories.where('position < ?', position).limit(1).order(position: :desc).first
end
