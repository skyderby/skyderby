class EventEntryPayment < ApplicationRecord
  ENTRY_PRICE_CENTS = 1500
  CHARGE_TYPE = 'event_entries'.freeze

  enum :kind, { purchase: 'purchase', refund: 'refund' }, suffix: true

  belongs_to :payable, polymorphic: true
  belongs_to :pay_charge, class_name: 'Pay::Charge'

  validates :entries, :amount_cents, presence: true
  validates :entries, numericality: { other_than: 0 }

  def self.reconcile_from_charge(pay_charge)
    Reconciler.new(pay_charge).call
  end
end
