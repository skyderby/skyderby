class RenameEventSeatPaymentsToEventEntryPayments < ActiveRecord::Migration[8.0]
  def change
    rename_table :event_seat_payments, :event_entry_payments
    rename_column :event_entry_payments, :seats, :entries

    rename_index :event_entry_payments,
                 'index_event_seat_payments_on_payable',
                 'index_event_entry_payments_on_payable'
    rename_index :event_entry_payments,
                 'index_event_seat_payments_unique_purchase',
                 'index_event_entry_payments_unique_purchase'
  end
end
