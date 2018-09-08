class CreatePlacePhotos < ActiveRecord::Migration[5.2]
  def change
    create_table :place_photos do |t|
      t.belongs_to :place
      t.attachment :image

      t.timestamps
    end
  end
end
