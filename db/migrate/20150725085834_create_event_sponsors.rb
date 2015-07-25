class CreateEventSponsors < ActiveRecord::Migration
  def change
    create_table :event_sponsors do |t|
      t.string :name
      t.attachment :logo
      t.string :website
      t.references :event, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
