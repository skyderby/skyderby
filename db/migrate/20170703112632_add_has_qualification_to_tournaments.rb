class AddHasQualificationToTournaments < ActiveRecord::Migration[5.1]
  def up
    add_column :tournaments, :has_qualification, :boolean
    execute <<~SQL
      UPDATE tournaments
      SET has_qualification = true
      WHERE id IN (SELECT DISTINCT tournament_id FROM qualification_rounds);
    SQL
  end

  def down
    remove_column :has_qualification
  end
end
