class CreateContributions < ActiveRecord::Migration[6.0]
  def change
    create_table :contributions do |t|
      t.decimal :amount
      t.date :received_at

      t.timestamps null: false
    end

    create_table :contribution_details do |t|
      t.belongs_to :contributor,
                   polymorphic: true,
                   null: false,
                   index: { name: :index_contribution_details_on_contributor }
      t.belongs_to :contribution, null: false, foreign_key: true

      t.timestamps null: false
    end
  end
end
