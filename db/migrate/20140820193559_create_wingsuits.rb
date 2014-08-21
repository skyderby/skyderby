class CreateWingsuits < ActiveRecord::Migration
  def change
    create_table :wingsuits do |t|
      t.references :manufacturer, index: true
      t.references :ws_class, index: true
    end
  end
end
