class UpdateEventListsToVersion6 < ActiveRecord::Migration[6.0]
  def change
    update_view :event_lists, version: 6, revert_to_version: 5
  end
end
