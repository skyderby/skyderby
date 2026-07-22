class PreserveFreeProViewsOnTrackDeletion < ActiveRecord::Migration[8.1]
  def up
    change_column_null :free_pro_views, :track_id, true
    remove_foreign_key :free_pro_views, :tracks
    add_foreign_key :free_pro_views, :tracks, on_delete: :nullify
  end

  def down
    remove_foreign_key :free_pro_views, :tracks
    change_column_null :free_pro_views, :track_id, false
    add_foreign_key :free_pro_views, :tracks
  end
end
