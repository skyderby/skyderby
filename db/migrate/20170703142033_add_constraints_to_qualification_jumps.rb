class AddConstraintsToQualificationJumps < ActiveRecord::Migration[5.1]
  def change
    add_index :qualification_jumps,
              %i[qualification_round_id tournament_competitor_id],
              unique: true,
              name: :index_qualification_jumps_on_round_and_competitor
    add_foreign_key :qualification_jumps, :tracks
  end
end
