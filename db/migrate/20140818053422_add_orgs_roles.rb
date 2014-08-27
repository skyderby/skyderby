class AddOrgsRoles < ActiveRecord::Migration
  def change
    add_column :organizers, :orgs_admin, :boolean
    add_column :organizers, :competitiors_admin, :boolean
    add_column :organizers, :rounds_admin, :boolean
    add_column :organizers, :tracks_admin, :boolean
  end
end
