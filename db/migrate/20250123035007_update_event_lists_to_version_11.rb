class UpdateEventListsToVersion11 < ActiveRecord::Migration[7.1]
  def change
    update_view :event_lists, version: 11, revert_to_version: 10
  end
end
