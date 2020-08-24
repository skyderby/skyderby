class CreateAnnouncements < ActiveRecord::Migration[6.0]
  def change
    create_table :announcements do |t|
      t.string :name, null: false
      t.string :text
      t.datetime :period_from, null: false
      t.datetime :period_to, null: false

      t.timestamps
    end
  end
end
