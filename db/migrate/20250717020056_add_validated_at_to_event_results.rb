class AddValidatedAtToEventResults < ActiveRecord::Migration[7.1]
  def change
    add_column :event_results, :validated_at, :datetime

    up_only do
      execute "UPDATE event_results SET validated_at = updated_at"
    end
  end
end
