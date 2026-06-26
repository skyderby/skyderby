class AddAliasToSpeedSkydivingCompetitionCompetitors < ActiveRecord::Migration[8.1]
  def change
    add_reference :speed_skydiving_competition_competitors,
                  :alias,
                  foreign_key: { to_table: :profile_aliases }
  end
end
