class ChangeOrgRoleColumnName < ActiveRecord::Migration
  def change
    rename_column :organizers, :competitiors_admin, :competitors_admin
  end
end
