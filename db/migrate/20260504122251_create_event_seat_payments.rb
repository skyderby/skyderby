class CreateEventSeatPayments < ActiveRecord::Migration[8.0]
  def change
    create_table :event_seat_payments do |t|
      t.references :payable, polymorphic: true, null: false, index: true
      t.references :pay_charge, null: false, foreign_key: { to_table: :pay_charges }
      t.integer :seats, null: false
      t.integer :amount_cents, null: false
      t.string :kind, null: false
      t.string :stripe_refund_id

      t.timestamps
    end

    add_index :event_seat_payments,
              %i[pay_charge_id kind],
              unique: true,
              where: "kind = 'purchase'",
              name: 'index_event_seat_payments_unique_purchase'

    add_index :event_seat_payments,
              :stripe_refund_id,
              unique: true,
              where: 'stripe_refund_id IS NOT NULL'
  end
end
