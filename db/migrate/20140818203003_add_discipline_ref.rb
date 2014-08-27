class AddDisciplineRef < ActiveRecord::Migration
  def change
    add_reference :rounds, :discipline
  end
end
