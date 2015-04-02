class CreateVirtualCompResults < ActiveRecord::Migration
  def change
    create_table :virtual_comp_results do |t|
      t.references :virtual_competitions, index: true
      t.references :tracks, index: true
      t.float :result

      t.timestamps
    end
  end
end
