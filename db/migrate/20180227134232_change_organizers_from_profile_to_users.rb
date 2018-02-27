class ChangeOrganizersFromProfileToUsers < ActiveRecord::Migration[5.1]
  def up
    add_reference :organizers, :user, index: true

    execute(<<~SQL)
      UPDATE organizers
      SET user_id = profiles.owner_id
      FROM profiles
      WHERE organizers.profile_id = profiles.id
      AND profiles.owner_type = 'User'
    SQL

    remove_reference :organizers, :profile
  end

  def down
    add_reference :organizers, :profile

    execute(<<~SQL)
      UPDATE organizers
      SET profile_id = profiles.id
      FROM profiles
      WHERE organizers.user_id = profiles.owner_id
      AND profiles.owner_type = 'User'
    SQL

    remove_reference :organizers, :user
  end
end
