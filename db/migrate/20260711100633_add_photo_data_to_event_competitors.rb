class AddPhotoDataToEventCompetitors < ActiveRecord::Migration[8.1]
  def change
    add_column :event_competitors, :photo_data, :jsonb
  end
end
