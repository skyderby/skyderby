class CreateEventRoundReferencePointAssignment < ActiveRecord::Migration[5.2]
  def change
    create_table :event_round_reference_point_assignments do |t|
      t.belongs_to :round
      t.belongs_to :competitor
      t.belongs_to :reference_point, index: false

      t.timestamps
    end

    add_index :event_round_reference_point_assignments,
              [:round_id, :competitor_id],
              unique: true,
              name: :index_reference_point_assignment_in_round_and_competitor
  end
end
