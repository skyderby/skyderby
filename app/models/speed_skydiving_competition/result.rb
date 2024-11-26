class SpeedSkydivingCompetition::Result < ApplicationRecord
  include AcceptsNestedTrack, SubmissionResult, EventOngoingValidation

  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :rounds
  belongs_to :competitor
  belongs_to :round
  belongs_to :track

  has_many :penalties, class_name: 'SpeedSkydivingCompetition::Result::Penalty', dependent: :destroy

  validates :competitor_id, uniqueness: { scope: :round_id }, on: :create
  validate :round_must_be_in_progress

  before_destroy :can_be_destroyed?

  delegate :number, to: :round, prefix: true
  delegate :tracks_visibility, to: :event

  accepts_nested_attributes_for :track, update_only: true, reject_if: :new_record?
  accepts_nested_attributes_for :penalties, update_only: true

  def penalty_size = 100 - penalties.inject(100) { |sum, penalty| sum * penalty.factor }

  def final_result = result.to_f * (1 - (penalty_size / 100))

  private

  def track_owner = event

  def track_comment = "#{event.name} - Round #{round_number}"

  def track_activity = :speed_skydiving

  def can_be_destroyed? = round_must_be_in_progress || throw(:abort)

  def round_must_be_in_progress
    return true unless round.completed?

    errors.add(:base, :round_completed)
    false
  end
end
