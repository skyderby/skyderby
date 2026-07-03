class AddPhotoToSpeedSkydivingCompetitionCompetitors < ActiveRecord::Migration[8.1]
  def change
    add_column :speed_skydiving_competition_competitors, :photo_data, :jsonb
  end
end
