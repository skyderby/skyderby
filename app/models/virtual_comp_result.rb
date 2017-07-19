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

class VirtualCompResult < ApplicationRecord
  belongs_to :virtual_competition
  belongs_to :track

  validates :virtual_competition, presence: true
  validates :track, presence: true
  validates_uniqueness_of :track_id, scope: :virtual_competition_id

  delegate :wingsuit, to: :track
  delegate :place, to: :track
  delegate :pilot, to: :track
end
