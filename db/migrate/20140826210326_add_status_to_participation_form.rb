class AddStatusToParticipationForm < ActiveRecord::Migration
  def change
    add_column :participation_forms, :status, :integer, default: 0
    add_column :participation_forms, :comment, :text
  end
end
