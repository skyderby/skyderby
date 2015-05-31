# create_table "virtual_competitions", force: true do |t|
#   t.integer  "jumps_kind"
#   t.integer  "suits_kind"
#   t.integer  "places_id"
#   t.date     "period_from"
#   t.date     "period_to"
#   t.integer  "discipline"
#   t.integer  "discipline_parameter"
#   t.datetime "created_at"
#   t.datetime "updated_at"
#   t.string   "name"
#   t.integer  "virtual_comp_group_id"
#   t.integer  "range_from"
#   t.integer  "range_to"
#   t.boolean  "display_highest_speed"
#   t.boolean  "display_highest_gr"
# end
#
# add_index "virtual_competitions", ["places_id"], name: "index_virtual_competitions_on_places_id", using: :btree

class VirtualCompetition < ActiveRecord::Base
  enum jumps_kind: [:skydive, :base]
  enum suits_kind: [:wingsuit, :tracksuit]
  enum discipline:
    [:time, :distance, :speed, :distance_in_time, :time_until_line]

  belongs_to :place
  belongs_to :group,
             class_name: 'VirtualCompGroup',
             foreign_key: 'virtual_comp_group_id'

  has_one :best_result, -> { order('result DESC') }, class_name: 'VirtualCompResult'
  has_many :virtual_comp_results

  def reprocess_results
    virtual_comp_results.each do |x|
      VirtualCompWorker.perform_async(x.track_id)
    end
  end
end
