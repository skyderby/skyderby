class AddOwnerToProfile < ActiveRecord::Migration[5.0]
  def up
    add_reference :profiles, :owner, polymorphic: true
    execute <<~SQL
      UPDATE profiles SET
      owner_id = user_id,
      owner_type = 'User'
      WHERE user_id IS NOT NULL
    SQL
    remove_reference :profiles, :user
  end

  def down
    add_reference :profiles, :user
    execute <<~SQL
      UPDATE profiles
      SET user_id = owner_id
      WHERE owner_type = 'User'
    SQL
    remove_reference :profiles, :owner, polymorphic: true
  end
end
