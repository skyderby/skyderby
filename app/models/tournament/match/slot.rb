# == Schema Information
#
# Table name: tournament_match_competitors
#
#  id                       :integer          not null, primary key
#  result                   :decimal(10, 3)
#  tournament_competitor_id :integer
#  tournament_match_id      :integer
#  track_id                 :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  is_winner                :boolean
#  is_disqualified          :boolean
#  is_lucky_looser          :boolean
#  notes                    :string(510)
#  earn_medal               :integer
#

class Tournament::Match::Slot < ApplicationRecord
  include AcceptsNestedTrack, Tournament::SubmissionResult

  enum earn_medal: { gold: 0, silver: 1, bronze: 2 }

  belongs_to :competitor
  belongs_to :match
  belongs_to :track, optional: true

  before_save :replace_nan_with_zero

  delegate :tournament, :start_time, :round, to: :match
  delegate :name, to: :competitor, prefix: true, allow_nil: true
  delegate :order, to: :round, prefix: true, allow_nil: true

  private

  def on_intersection_not_found
    self.result = 0
    self.is_disqualified = true
    self.notes = "Didn't intersected finish line"
  end

  def finish_line
    tournament.finish_line
  end

  def track_owner
    tournament
  end

  def tracks_visibility
    :public_track
  end

  def track_activity
    :base
  end

  def track_comment
    "#{tournament.name} - Round #{round.order}"
  end

  def replace_nan_with_zero
    return if result.nil?

    self.result = 0 if result.nan? || result.infinite?
  end
end
