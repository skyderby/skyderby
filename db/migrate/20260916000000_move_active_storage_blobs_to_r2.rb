class MoveActiveStorageBlobsToR2 < ActiveRecord::Migration[8.1]
  def up
    execute "UPDATE active_storage_blobs SET service_name = 'r2' WHERE service_name IN ('amazon', 'amazon_to_r2')"
  end

  def down
    execute "UPDATE active_storage_blobs SET service_name = 'amazon' WHERE service_name = 'r2'"
  end
end
