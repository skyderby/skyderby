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
#  profile_id             :integer
#  highest_speed          :float            default(0.0)
#  highest_gr             :float            default(0.0)
#

class VirtualCompResult < ActiveRecord::Base
  belongs_to :virtual_competition
  belongs_to :track
  belongs_to :profile

  validates_presence_of :virtual_competition
  validates_presence_of :track
  validates_presence_of :profile
  validates_uniqueness_of :track_id, scope: :virtual_competition_id

  delegate :wingsuit, to: :track
end
