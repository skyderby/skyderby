class RenameBadgeTypeToKind < ActiveRecord::Migration
  def change
    rename_column :badges, :type, :kind
  end
end
