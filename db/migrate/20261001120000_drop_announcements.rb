class DropAnnouncements < ActiveRecord::Migration[8.1]
  def change
    drop_table :announcements do |t|
      t.string :name, null: false
      t.string :text
      t.datetime :period_from, precision: nil, null: false
      t.datetime :period_to, precision: nil, null: false
      t.timestamps
    end
  end
end
