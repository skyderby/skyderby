class ReplacePolymorphicContributorWithProfile < ActiveRecord::Migration[7.1]
  def up
    remove_index :contribution_details, [:contributor_type, :contributor_id]
    remove_column :contribution_details, :contributor_type
    rename_column :contribution_details, :contributor_id, :profile_id
    add_foreign_key :contribution_details, :profiles
  end

  def down
    remove_foreign_key :contribution_details, :profiles
    rename_column :contribution_details, :profile_id, :contributor_id
    add_column :contribution_details, :contributor_type, :string
    Contribution::Detail.update_all(contributor_type: 'Profile')
    add_index :contribution_details, [:contributor_type, :contributor_id]
  end
end
