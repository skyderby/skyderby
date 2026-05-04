module EventPayable
  extend ActiveSupport::Concern

  BILLING_STARTS_AT = Date.new(2026, 4, 30)

  included do
    has_many :entry_payments,
             -> { order(created_at: :desc) },
             as: :payable,
             class_name: 'EventEntryPayment',
             dependent: :destroy,
             inverse_of: :payable
  end

  def paid_entries
    entry_payments.sum(:entries)
  end

  def entries_underpaid?
    paid_entries < competitors.count
  end

  def billable?
    starts_at.present? && starts_at > BILLING_STARTS_AT
  end
end
