class AddSuitAndCommentToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :suit, :string
    add_column :tracks, :comment, :text
  end
end
