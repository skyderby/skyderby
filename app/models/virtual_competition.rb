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
# end
#
# add_index "virtual_competitions", ["places_id"], name: "index_virtual_competitions_on_places_id", using: :btree

class VirtualCompetition < ActiveRecord::Base
  belongs_to :place
  belongs_to :group,
             class_name: 'VirtualCompGroup',
             foreign_key: 'virtual_comp_group_id'
  has_many :virtual_comp_results

  enum jumps_kind: [:skydive, :base]
  enum suits_kind: [:wingsuit, :tracksuit]
  enum discipline: 
    [:time, :distance, :speed, :distance_in_time, :straightline_distance_in_time]

  def self.by_track(track)
    competitions = VirtualCompetition.order(:name)
    competitions = competitions.tracksuit if track.wingsuit.tracksuit?
    competitions = competitions.wingsuit if track.wingsuit.wingsuit?

    # Place = nil means worldwide (without filter)
    # BASE jumps could be only used in virtual competitions with place
    if track.skydive?
      competitions = 
        competitions.skydive
                    .where('place_id = ? OR place_id IS NULL', track.place_id)
    elsif track.base?
      competitions = competitions.base.where(place_id: track.place_id)
    end

    competitions = competitions.where('period_from <= ?', track.created_at)
    competitions = competitions.where('period_to >= ?', track.created_at)

    competitions
  end

  def reprocess_results
    virtual_comp_results.each do |x|
      VirtualCompWorker.perform_async(x.track_id)
    end
  end
end
