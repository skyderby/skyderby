class AddCommentAndTypeToBadges < ActiveRecord::Migration[5.1]
  def up
    add_column :badges, :comment, :string
    add_column :badges, :category, :integer, null: false, default: 0

    execute <<~SQL
      UPDATE badges SET category = 0;
    SQL
  end

  def down
    remove_column :badges, :comment
    remove_column :badges, :category
  end
end
