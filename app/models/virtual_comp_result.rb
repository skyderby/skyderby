# == Schema Information
#
# Table name: virtual_comp_results
#
#  id                     :integer          not null, primary key
#  virtual_competition_id :integer
#  track_id               :integer
#  result                 :float(24)        default(0.0)
#  created_at             :datetime
#  updated_at             :datetime
#  user_profile_id        :integer
#  highest_speed          :float(24)        default(0.0)
#  highest_gr             :float(24)        default(0.0)
#

# create_table "virtual_comp_results", force: true do |t|
#   t.integer  "virtual_competitions_id"
#   t.integer  "tracks_id"
#   t.float    "result",                  limit: 24
#   t.datetime "created_at"
#   t.datetime "updated_at"
#   t.integer  "user_profile_id"
# end
#
# add_index "virtual_comp_results", ["tracks_id"], name: "index_virtual_comp_results_on_tracks_id", using: :btree
# add_index "virtual_comp_results", ["virtual_competitions_id"], name: "index_virtual_comp_results_on_virtual_competitions_id", using: :btree

class VirtualCompResult < ActiveRecord::Base
  belongs_to :virtual_competition
  belongs_to :track
  belongs_to :user_profile

  validates :virtual_competition, presence: true
  validates :track, presence: true
  validates :user_profile, presence: true

  delegate :wingsuit, to: :track
end
