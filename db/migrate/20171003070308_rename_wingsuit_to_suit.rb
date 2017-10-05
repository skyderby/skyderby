class RenameWingsuitToSuit < ActiveRecord::Migration[5.1]
  def change
    rename_table :wingsuits, :suits
    rename_column :tournament_competitors, :wingsuit_id, :suit_id
    rename_column :competitors, :wingsuit_id, :suit_id
    rename_column :tracks, :wingsuit_id, :suit_id
    rename_column :tracks, :suit, :missing_suit_name
  end
end
