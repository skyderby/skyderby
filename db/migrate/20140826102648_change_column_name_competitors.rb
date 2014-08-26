class ChangeColumnNameCompetitors < ActiveRecord::Migration
  def change
    remove_reference :competitors, :participation_forms
    add_reference :competitors, :participation_form
  end
end
