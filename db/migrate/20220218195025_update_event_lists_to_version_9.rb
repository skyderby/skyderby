class UpdateEventListsToVersion9 < ActiveRecord::Migration[6.0]
  def change
    update_view :event_lists, version: 9, revert_to_version: 8
  end
end
