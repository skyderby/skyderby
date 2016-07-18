class RenameUserProfiles < ActiveRecord::Migration
  def change
    rename_table :user_profiles, :profiles
    rename_column :badges, :user_profile_id, :profile_id
    rename_column :competitors, :user_profile_id, :profile_id
    rename_column :events, :user_profile_id, :profile_id
    rename_column :event_organizers, :user_profile_id, :profile_id
    rename_column :event_tracks, :user_profile_id, :profile_id
    rename_column :rounds, :user_profile_id, :profile_id
    rename_column :tracks, :user_profile_id, :profile_id
    rename_column :tournament_competitors, :user_profile_id, :profile_id
    rename_column :virtual_comp_results, :user_profile_id, :profile_id

    reversible do |dir|
      dir.up do
        FileUtils.mv(
          Rails.root.join('public', 'system', 'user_profiles'),
          Rails.root.join('public', 'system', 'profiles')
        )
      end

      dir.down do
        FileUtils.mv(
          Rails.root.join('public', 'system', 'profiles'),
          Rails.root.join('public', 'system', 'user_profiles')
        )
      end
    end
  end
end
