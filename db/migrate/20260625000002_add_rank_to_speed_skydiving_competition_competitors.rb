class AddRankToSpeedSkydivingCompetitionCompetitors < ActiveRecord::Migration[8.1]
  def change
    add_column :speed_skydiving_competition_competitors, :rank, :integer
  end
end
