class CreateEventDocuments < ActiveRecord::Migration
  def change
    create_table :event_documents do |t|
      t.string :name
      t.text :description

      t.attachment :attached_file
    end
  end
end
