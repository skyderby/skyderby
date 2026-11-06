class AddCostToTrackDebriefs < ActiveRecord::Migration[8.1]
  def change
    change_table :track_debriefs, bulk: true do |t|
      t.decimal :cost_usd, precision: 10, scale: 5
      t.float :generation_seconds
    end
  end
end
