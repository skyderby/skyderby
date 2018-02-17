class ChangeEventOrganizersToOrganizable < ActiveRecord::Migration[5.1]
  def up
    rename_table :event_organizers, :organizers
    rename_column :organizers, :event_id, :organizable_id
    add_column :organizers, :organizable_type, :string

    execute(<<~SQL)
      UPDATE organizers SET organizable_type = 'Event'
    SQL
  end

  def down
    remove_column :organizers, :organizable_type
    rename_column :organizers, :organizable_id, :event_id
    rename_table :organizers, :event_organizers
  end
end
