class ChangeColumnTypeInCompetitor < ActiveRecord::Migration
  def change
    #remove_reference :competitors, :participatable
    add_reference :competitors, :participation_forms
  end
end
