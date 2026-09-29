class AddClientUuidToTracks < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :tracks, :client_uuid, :uuid
    add_index :tracks, %i[owner_type owner_id client_uuid],
              unique: true,
              where: 'client_uuid IS NOT NULL',
              algorithm: :concurrently
  end
end
