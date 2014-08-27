class AddReferenceToPartForms < ActiveRecord::Migration
  def change
    add_reference :participation_forms, :user
    add_reference :participation_forms, :event
  end
end
