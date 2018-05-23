class CreateVirtualCompetitionIntervals < ActiveRecord::Migration[5.2]
  def change
    add_column :virtual_competitions, :interval_type, :integer, null: false, default: 0

    create_table :virtual_competition_custom_intervals do |t|
      t.belongs_to :virtual_competition, index: { name: 'index_custom_intervals_on_virtual_competition_id' }
      t.string :name
      t.string :slug
      t.datetime :period_from
      t.datetime :period_to

      t.timestamps
    end
  end
end
