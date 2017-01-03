class CreateEventLists < ActiveRecord::Migration
  def change
    create_view :event_lists
  end
end
