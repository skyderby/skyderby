class AddKindToWingsuits < ActiveRecord::Migration
  def change
    add_column :wingsuits, :kind, :integer, default: 0
  end
end
