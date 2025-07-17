# == Schema Information
#
# Table name: event_results
#
#  id                      :integer          not null, primary key
#  round_id                :integer
#  track_id                :integer
#  created_at              :datetime
#  updated_at              :datetime
#  competitor_id           :integer
#  result                  :decimal(10, 2)
#  profile_id              :integer
#  result_net              :decimal(10, 2)
#  is_disqualified         :boolean          default(FALSE)
#  disqualification_reason :string
#

class Event < ApplicationRecord
  class Result < ApplicationRecord
    include TrackPoints # provides points and window_points
    include EventOngoingValidation, Event::Namespace, AcceptsNestedTrack,
            SubmissionAuthor, SubmissionResult, ReviewableByJudge, ExitTime, FlightDetails

    belongs_to :track
    belongs_to :round, class_name: 'Event::Round'
    belongs_to :competitor, touch: true

    scope :chronologically, -> { order(:created_at) }

    validates :competitor_id, uniqueness: { scope: :round_id }, on: :create

    delegate :event, :event_id, :range_from, :range_to, to: :round
    delegate :discipline, :number, to: :round, prefix: true
    delegate :section, to: :competitor
    delegate :tracks_visibility, to: :round

    def reference_point
      round.reference_point_assignments
           .find { _1.competitor_id == competitor_id }&.reference_point
    end

    def penalty_sizes = [10, 20, 50, 100]

    def apply_penalty_to_result? = !event.apply_penalty_to_score

    def apply_penalty_to_score? = event.apply_penalty_to_score

    private

    def track_owner = event

    def track_comment = "#{event.name} - #{round_discipline.humanize} #{round_number}"

    def track_activity = :skydive

    def suit_id = competitor.suit_id
  end
end
