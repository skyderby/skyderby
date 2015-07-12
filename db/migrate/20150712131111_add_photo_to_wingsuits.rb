class AddPhotoToWingsuits < ActiveRecord::Migration
  def change
    add_attachment :wingsuits, :photo
    remove_column :wingsuits, :ws_class_id
    add_column :wingsuits, :description, :text
  end
end
