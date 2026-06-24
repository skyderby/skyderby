class AddCompletedToQualificationRounds < ActiveRecord::Migration[8.1]
  def change
    add_column :qualification_rounds, :completed, :boolean, default: false, null: false
  end
end
