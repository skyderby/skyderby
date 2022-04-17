class UpdateEventListsToVersion10 < ActiveRecord::Migration[6.0]
  def change
    update_view :event_lists, version: 10, revert_to_version: 9
  end
end
