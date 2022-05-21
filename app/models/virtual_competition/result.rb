# == Schema Information
#
# Table name: virtual_comp_results
#
#  id                     :integer          not null, primary key
#  virtual_competition_id :integer
#  track_id               :integer
#  result                 :float            default(0.0)
#  created_at             :datetime
#  updated_at             :datetime
#  highest_speed          :float            default(0.0)
#  highest_gr             :float            default(0.0)
#

class VirtualCompetition::Result < ApplicationRecord
  belongs_to :virtual_competition
  belongs_to :track

  validates :track_id, uniqueness: { scope: %i[virtual_competition_id wind_cancelled] }

  scope :wind_cancellation, ->(enabled) { where(wind_cancelled: enabled) }

  delegate :suit, to: :track
  delegate :place, to: :track
  delegate :pilot, to: :track
end
