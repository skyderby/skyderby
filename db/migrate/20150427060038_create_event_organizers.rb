class CreateEventOrganizers < ActiveRecord::Migration
  def change
    create_table :event_organizers do |t|
      t.references :event, index: true
      t.references :user_profile, index: true

      t.timestamps
    end
  end
end
