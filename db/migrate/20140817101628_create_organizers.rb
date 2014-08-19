class CreateOrganizers < ActiveRecord::Migration
  def change
    create_table :organizers do |t|
      t.references :event, index: true
      t.references :user

      t.timestamps
    end
  end
end
