class SpeedSkydivingCompetition::Result < ApplicationRecord
  include AcceptsNestedTrack

  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :rounds
  belongs_to :competitor
  belongs_to :round
  belongs_to :track

  has_many :penalties, class_name: 'SpeedSkydivingCompetition::Result::Penalty', dependent: :destroy

  validates :competitor_id, uniqueness: { scope: :round_id }, on: :create

  before_save :calculate_result

  delegate :number, to: :round, prefix: true
  delegate :tracks_visibility, to: :event

  private

  def calculate_result
    self.result = 450
  end

  def track_owner = event

  def track_comment = "#{event.name} - Round #{round_number}"

  def track_activity = :speed_skydiving
end
