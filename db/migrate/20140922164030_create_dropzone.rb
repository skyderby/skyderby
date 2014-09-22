class CreateDropzone < ActiveRecord::Migration
  def change
    create_table :dropzones do |t|
      t.string :name
      t.string :name_eng
      t.float :latitude
      t.float :longitude

      t.text :information
    end
  end
end
