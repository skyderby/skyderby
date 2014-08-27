class CreateCompetitors < ActiveRecord::Migration
  def change
    create_table :competitors do |t|
      t.references :event, index: true
      t.references :user

      t.timestamps
    end
  end
end
