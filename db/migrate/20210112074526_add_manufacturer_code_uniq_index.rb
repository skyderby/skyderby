class AddManufacturerCodeUniqIndex < ActiveRecord::Migration[6.0]
  def change
    add_index :manufacturers, :code, unique: true
  end
end
