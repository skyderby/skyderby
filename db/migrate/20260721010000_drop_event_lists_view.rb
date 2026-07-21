class DropEventListsView < ActiveRecord::Migration[8.1]
  def up
    drop_view :event_lists, revert_to_version: 11
  end

  def down
    create_view :event_lists, version: 11
  end
end
