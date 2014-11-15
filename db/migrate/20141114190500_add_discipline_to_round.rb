class AddDisciplineToRound < ActiveRecord::Migration
  def change
    add_column :rounds, :discipline, :integer
  end
end
