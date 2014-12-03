class AddNameToCompetitors < ActiveRecord::Migration
  def change
    add_column :competitors, :name, :string
  end
end
