class PerformanceCompetition::Result < ApplicationRecord
  self.table_name = :event_results

  include Event::TrackPoints # provides points and window_points
  include EventOngoingValidation, AcceptsNestedTrack, Event::SubmissionAuthor,
          Event::SubmissionResult, Event::FlightDetails

  belongs_to :track
  belongs_to :round
  belongs_to :competitor, touch: true

  scope :chronologically, -> { order(:created_at) }

  validates :competitor_id, uniqueness: { scope: :round_id }, on: :create

  delegate :event, :event_id, :range_from, :range_to, to: :round
  delegate :discipline, :number, to: :round, prefix: true
  delegate :category, to: :competitor
  delegate :tracks_visibility, to: :round

  def reference_point
    round.reference_point_assignments
         .find { it.competitor_id == competitor_id }&.reference_point
  end

  def penalty_sizes = [10, 20, 50, 100]

  def apply_penalty_to_result? = !event.apply_penalty_to_score

  def apply_penalty_to_score? = event.apply_penalty_to_score

  def validated? = validated_at.present?

  def validated=(status)
    result_validated = ActiveModel::Type::Boolean.new.cast(status)
    self.validated_at = result_validated ? Time.zone.now : nil
  end

  private

  def track_owner = event

  def track_comment = "#{event.name} - #{round_discipline.humanize} #{round_number}"

  def track_activity = :skydive

  def suit_id = competitor.suit_id
end
