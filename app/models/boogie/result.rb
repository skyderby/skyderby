class Boogie::Result < ApplicationRecord
  include TrackPoints # provides points and window_points
  include EventOngoingValidation, AcceptsNestedTrack,
          SubmissionAuthor, SubmissionResult, ReviewableByJudge, ExitTime, FlightDetails

  belongs_to :track
  belongs_to :round
  belongs_to :competitor, touch: true

  scope :chronologically, -> { order(:created_at) }

  validates :competitor_id, uniqueness: { scope: :round_id }, on: :create

  delegate :event, :event_id, :range_from, :range_to, to: :round
  delegate :discipline, :number, to: :round, prefix: true
  delegate :section, to: :competitor
  delegate :tracks_visibility, to: :round

  def reference_point
    round.reference_point_assignments.find_by(competitor: competitor)&.reference_point
  end

  def penalty_sizes = [10, 20, 50, 100]

  private

  def track_owner = event

  def track_comment = "#{event.name} - #{round_discipline.humanize} #{round_number}"

  def track_activity = :skydive
end
