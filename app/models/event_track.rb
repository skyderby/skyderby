# == Schema Information
#
# Table name: event_tracks
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

class EventTrack < ApplicationRecord
  include EventOngoingValidation, AcceptsNestedTrack, SubmissionAuthor, SubmissionResult,
          ReviewableByJudge

  belongs_to :track
  belongs_to :round
  belongs_to :competitor, touch: true

  scope :for_round, ->(round_id) { where(round_id: round_id) }

  validates :competitor, :round, :track, presence: true
  validates :competitor_id, uniqueness: { scope: :round_id }, on: :create
  validate_duplicates_on_file_with EventTracks::FileDuplicationValidator

  delegate :event, :event_id, :range_from, :range_to, to: :round
  delegate :discipline, to: :round, prefix: true
  delegate :number, to: :round, prefix: true
  delegate :section, to: :competitor
  delegate :tracks_visibility, to: :event

  def result(net: false)
    net ? self[:result_net] : self[:result]
  end

  def final_result(net: false)
    observed_result = result(net: net)
    return observed_result if observed_result.blank? || !penalized

    observed_result - observed_result / 100 * penalty_size    
  end

  def best_in_section?(net: false)
    self == section.best_result(net: net)
  end

  def worst_in_section?(net: false)
    self == section.worst_result(net: net)
  end

  def penalty_sizes
    [10, 20, 50, 100]
  end

  private

  def track_owner
    event
  end

  def track_comment
    "#{event.name} - #{round_discipline.humanize} #{round_number}"
  end
end
