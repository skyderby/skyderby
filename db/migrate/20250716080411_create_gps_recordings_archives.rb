class CreateGpsRecordingsArchives < ActiveRecord::Migration[7.1]
  def change
    create_table :gps_recordings_archives do |t|
      t.references :event, polymorphic: true, null: false
      t.integer :status, default: 0, null: false
      t.jsonb :file_data
      t.timestamps
    end

    add_index :gps_recordings_archives, [:event_type, :event_id], unique: true
  end
end
