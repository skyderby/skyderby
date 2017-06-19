class AddBracketSizeToTournament < ActiveRecord::Migration[5.0]
  def up
    add_column :tournaments, :bracket_size, :integer
    execute 'UPDATE tournaments SET bracket_size = 2'
  end

  def down
    remove_column :tournaments, :bracket_size
  end
end
