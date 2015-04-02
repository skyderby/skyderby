class RenamePlacesToPlaceInVirtualComp < ActiveRecord::Migration
  def change
    rename_column :virtual_competitions, :places_id, :place_id
  end
end
