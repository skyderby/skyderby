class AddLogoDataToSponsors < ActiveRecord::Migration[6.0]
  def change
    add_column :sponsors, :logo_data, :jsonb
  end
end
