class ChangeRoundNameToRoundNumber < ActiveRecord::Migration[5.1]
  def up
    add_column :rounds, :number, :integer
    execute('UPDATE rounds SET number = name::integer;')
    remove_column :rounds, :name
  end

  def down
    add_column :rounds, :name, :string
    execute('UPDATE rounds SET name = number;')
    remove_column :rounds, :number
  end
end
