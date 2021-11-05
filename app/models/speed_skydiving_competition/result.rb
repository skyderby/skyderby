class SpeedSkydivingCompetition::Result < ApplicationRecord
  include AcceptsNestedTrack, SubmissionResult

  belongs_to :event, class_name: 'SpeedSkydivingCompetition', inverse_of: :rounds
  belongs_to :competitor
  belongs_to :round
  belongs_to :track

  validates :competitor_id, uniqueness: { scope: :round_id }, on: :create

  delegate :number, to: :round, prefix: true
  delegate :tracks_visibility, to: :event

  accepts_nested_attributes_for :track, update_only: true, reject_if: :new_record?

  private

  def track_owner = event

  def track_comment = "#{event.name} - Round #{round_number}"

  def track_activity = :speed_skydiving
end
