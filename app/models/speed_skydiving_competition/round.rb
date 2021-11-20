class SpeedSkydivingCompetition::Round < ApplicationRecord
  include Completable

  belongs_to :event, touch: true, class_name: 'SpeedSkydivingCompetition', inverse_of: :rounds

  validates :number, presence: true

  before_create :set_number
  after_destroy :renumber_subsequent

  scope :ordered, -> { order(:number, :created_at) }

  private

  def set_number
    self.number = last_number_within_event + 1
  end

  def renumber_subsequent
    event.rounds.where('number > ?', number).update_all('number = number - 1') # rubocop:disable Rails/SkipsModelValidations
  end

  def last_number_within_event = event.rounds.maximum(:number) || 0
end
