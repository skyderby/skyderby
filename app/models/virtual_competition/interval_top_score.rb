# == Schema Information
#
# Table name: annual_top_scores
#
#  rank                   :integer
#  virtual_competition_id :integer
#  year                   :float
#  track_id               :integer
#  result                 :float
#  highest_speed          :float
#  highest_gr             :float
#  profile_id             :integer
#  suit_id                :integer
#  recorded_at            :datetime
#

class VirtualCompetition::IntervalTopScore < ApplicationRecord
  self.table_name = 'interval_top_scores'

  belongs_to :virtual_competition
  belongs_to :custom_interval
  belongs_to :track
  belongs_to :profile
  belongs_to :suit

  scope :for, ->(interval) { where(custom_interval: interval) }
  scope :wind_cancellation, ->(enabled) { where(wind_cancelled: enabled) }

  private

  def readonly?
    true
  end
end
