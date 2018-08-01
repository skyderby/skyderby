class ScopeEventDependentModels < ActiveRecord::Migration[5.2]
  def change
    rename_table :competitors, :event_competitors
    rename_table :sections, :event_sections
    rename_table :event_tracks, :event_results

    rename_table :event_round_reference_point_assignments, :event_reference_point_assignments
  end
end
