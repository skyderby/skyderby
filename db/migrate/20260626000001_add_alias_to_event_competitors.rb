class AddAliasToEventCompetitors < ActiveRecord::Migration[8.1]
  def change
    add_reference :event_competitors, :alias, foreign_key: { to_table: :profile_aliases }
  end
end
