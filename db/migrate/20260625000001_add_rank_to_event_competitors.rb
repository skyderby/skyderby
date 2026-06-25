class AddRankToEventCompetitors < ActiveRecord::Migration[8.1]
  def change
    add_column :event_competitors, :rank, :integer
  end
end
