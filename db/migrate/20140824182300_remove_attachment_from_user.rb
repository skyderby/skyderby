class RemoveAttachmentFromUser < ActiveRecord::Migration
  def change
    remove_column :users, :userpic_file_name
    remove_column :users, :userpic_content_type
    remove_column :users, :userpic_file_size
    remove_column :users, :userpic_updated_at
  end
end
