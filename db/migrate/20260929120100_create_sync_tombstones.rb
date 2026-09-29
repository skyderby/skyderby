class CreateSyncTombstones < ActiveRecord::Migration[8.1]
  def change
    create_table :sync_tombstones do |t|
      t.string :resource, null: false
      t.bigint :record_id, null: false
      t.datetime :deleted_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }
      t.timestamps
      t.index %i[resource deleted_at]
      t.index :deleted_at
    end
  end
end
