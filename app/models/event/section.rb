# == Schema Information
#
# Table name: sections
#
#  id       :integer          not null, primary key
#  name     :string(510)
#  order    :integer
#  event_id :integer
#

class Event::Section < ApplicationRecord
  include EventOngoingValidation, Event::Namespace

  belongs_to :event, touch: true
  has_many :competitors, dependent: :restrict_with_error
  has_many :results, through: :competitors

  scope :ordered, -> { order(:order) }

  validates :name, :event, presence: true

  before_create :set_order

  def first_position?
    order == min_order_within_event
  end

  def last_position?
    order == max_order_within_event
  end

  def move_upper
    return unless higher_section

    swap_position_with higher_section
  end

  def move_lower
    return unless lower_section

    swap_position_with lower_section
  end

  private

  def swap_position_with(other_section)
    tmp_order = order
    ActiveRecord::Base.transaction do
      update(order: other_section.order)
      other_section.update(order: tmp_order)
    end
  end

  def lower_section
    @lower_section ||=
      event.sections.where('"order" > ?', order).limit(1).order(:order).first
  end

  def higher_section
    @higher_section ||=
      event.sections.where('"order" < ?', order).limit(1).order(order: :desc).first
  end

  def set_order
    self.order = max_order_within_event + 1
  end

  def max_order_within_event
    event.sections.maximum(:order) || 0
  end

  def min_order_within_event
    event.sections.minimum(:order) || 0
  end
end
