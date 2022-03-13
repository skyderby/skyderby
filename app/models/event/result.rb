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

    validates :competitor, :round, :track, presence: true
    validates :competitor_id, uniqueness: { scope: :round_id }, on: :create
    validate_duplicates_on_file_with EventTracks::FileDuplicationValidator

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
end
