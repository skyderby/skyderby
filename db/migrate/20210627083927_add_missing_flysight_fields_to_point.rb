class AddMissingFlysightFieldsToPoint < ActiveRecord::Migration[6.0]
  def change
    change_table :points, bulk: true do |t|
      t.float :horizontal_accuracy
      t.float :vertical_accuracy
      t.float :speed_accuracy
      t.float :heading_accuracy
      t.float :heading
      t.integer :number_of_satellites
      t.integer :gps_fix
    end
  end
end
