class DropEventListsView < ActiveRecord::Migration[8.1]
  def up
    execute 'DROP VIEW IF EXISTS event_lists'
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
