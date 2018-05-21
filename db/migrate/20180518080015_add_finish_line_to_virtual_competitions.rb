class AddFinishLineToVirtualCompetitions < ActiveRecord::Migration[5.2]
  def change
    add_reference :virtual_competitions, :finish_line, foreign_key: true
  end
end
