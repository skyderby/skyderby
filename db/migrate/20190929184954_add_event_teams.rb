class AddEventTeams < ActiveRecord::Migration[5.2]
  def change
    create_table :event_teams do |t|
      t.belongs_to :event
      t.string :name

      t.timestamps
    end

    add_reference :event_competitors, :team, foreign_key: { to_table: :event_teams }
  end
end
