class UpdateEventListsToVersion7 < ActiveRecord::Migration[6.0]
  def change
    update_view :event_lists, version: 7, revert_to_version: 6
  end
end
