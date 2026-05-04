class EventSeatPayment < ApplicationRecord
  SEAT_PRICE_CENTS = 1500
  CHARGE_TYPE = 'event_seats'.freeze

  enum :kind, { purchase: 'purchase', refund: 'refund' }, suffix: true

  belongs_to :payable, polymorphic: true
  belongs_to :pay_charge, class_name: 'Pay::Charge'

  validates :seats, :amount_cents, presence: true
  validates :seats, numericality: { other_than: 0 }

  def self.reconcile_from_charge(pay_charge)
    Reconciler.new(pay_charge).call
  end
end
