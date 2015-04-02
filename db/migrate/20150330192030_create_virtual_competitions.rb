class CreateVirtualCompetitions < ActiveRecord::Migration
  def change
    create_table :virtual_competitions do |t|
      t.integer :jumps_kind
      t.integer :suits_kind
      t.references :places, index: true
      t.date :period_from
      t.date :period_to
      t.integer :discipline
      t.integer :discipline_parameter

      t.timestamps
    end
  end
end
