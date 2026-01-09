class AddDonorToProfilesAndSubscribedToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :profiles, :donor, :boolean, default: false, null: false
    add_column :users, :subscribed, :boolean, default: false, null: false

    up_only do
      execute <<-SQL
        UPDATE profiles
        SET donor = TRUE
        WHERE id IN (SELECT DISTINCT profile_id FROM contribution_details)
      SQL

      execute <<-SQL
        UPDATE users
        SET subscribed = TRUE
        WHERE id IN (
          SELECT user_id FROM gifted_subscriptions
          WHERE expires_at > NOW()
        )
      SQL
    end
  end
end
