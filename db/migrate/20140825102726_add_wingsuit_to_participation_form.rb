class AddWingsuitToParticipationForm < ActiveRecord::Migration
  def change
    add_reference :participation_forms, :wingsuit
  end
end
