class RemovePhotoFromSuits < ActiveRecord::Migration[6.0]
  def change
    remove_column :suits, :photo_file_name, :string, limit: 510
    remove_column :suits, :photo_content_type, :string, limit: 510
    remove_column :suits, :photo_file_size, :integer
    remove_column :suits, :photo_updated_at, :datetime
  end
end
