class AddReferenceToEventDocs < ActiveRecord::Migration
  def change
    add_reference :event_documents, :event, index: true
  end
end
