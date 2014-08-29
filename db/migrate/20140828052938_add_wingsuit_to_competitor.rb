class AddWingsuitToCompetitor < ActiveRecord::Migration
  def change
    add_reference :competitors, :wingsuit
  end
end
