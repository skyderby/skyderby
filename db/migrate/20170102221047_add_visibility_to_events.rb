class AddVisibilityToEvents < ActiveRecord::Migration[5.0]
  def up
    add_column :events, :visibility, :integer, default: 0
    execute(<<-STATEMENT)
      UPDATE events SET visibility = CASE WHEN status = 0 THEN 1 ELSE 0 END
    STATEMENT
  end

  def down
    remove_column :events, :visibility
  end
end
