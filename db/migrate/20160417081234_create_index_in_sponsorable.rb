class CreateIndexInSponsorable < ActiveRecord::Migration
  def change
    add_index :sponsors, [:sponsorable_id, :sponsorable_type]
  end
end
