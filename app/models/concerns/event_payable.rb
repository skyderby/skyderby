module EventPayable
  extend ActiveSupport::Concern

  BILLING_STARTS_AT = Date.new(2026, 4, 30)

  included do
    has_many :seat_payments,
             -> { order(created_at: :desc) },
             as: :payable,
             class_name: 'EventSeatPayment',
             dependent: :destroy,
             inverse_of: :payable
  end

  def paid_seats
    seat_payments.sum(:seats)
  end

  def seats_underpaid?
    paid_seats < competitors.count
  end

  def billable?
    starts_at.present? && starts_at > BILLING_STARTS_AT
  end
end
