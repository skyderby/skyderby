class AddImageDataToPlacePhotos < ActiveRecord::Migration[6.0]
  def change
    add_column :place_photos, :image_data, :jsonb
  end
end
