class CreateEventReferencePoints < ActiveRecord::Migration[5.2]
  def change
    create_table :event_reference_points do |t|
      t.belongs_to :event
      t.string :name
      t.decimal :latitude, precision: 15, scale: 10
      t.decimal :longitude, precision: 15, scale: 10

      t.timestamps
    end
  end
end
