class RemovePaperclipColumns < ActiveRecord::Migration[6.0]
  def change
    remove_column :place_photos, :image_file_name, :string
    remove_column :place_photos, :image_content_type, :string
    remove_column :place_photos, :image_file_size, :integer
    remove_column :place_photos, :image_updated_at, :datetime

    remove_column :profiles, :userpic_file_name, :string
    remove_column :profiles, :userpic_content_type, :string
    remove_column :profiles, :userpic_file_size, :integer
    remove_column :profiles, :userpic_updated_at, :datetime

    remove_column :sponsors, :logo_file_name, :string
    remove_column :sponsors, :logo_content_type, :string
    remove_column :sponsors, :logo_file_size, :integer
    remove_column :sponsors, :logo_updated_at, :datetime
  end
end
