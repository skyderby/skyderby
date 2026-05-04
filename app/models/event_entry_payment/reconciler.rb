class EventEntryPayment::Reconciler
  def initialize(pay_charge)
    @pay_charge = pay_charge
  end

  def call
    return unless event_entries_charge?
    return unless event

    ensure_purchase_row
    ensure_refund_rows
  end

  private

  attr_reader :pay_charge

  def event_entries_charge?
    pay_charge.metadata&.dig('type') == EventEntryPayment::CHARGE_TYPE
  end

  def event
    @event ||= begin
      type = pay_charge.metadata['event_type']
      id = pay_charge.metadata['event_id']
      klass = type.safe_constantize
      klass&.find_by(id: id)
    end
  end

  def ensure_purchase_row
    return if EventEntryPayment.exists?(pay_charge_id: pay_charge.id, kind: 'purchase')

    entries = pay_charge.metadata['entries'].to_i
    return if entries <= 0

    EventEntryPayment.create!(
      payable: event,
      pay_charge: pay_charge,
      entries: entries,
      amount_cents: entries * EventEntryPayment::ENTRY_PRICE_CENTS,
      kind: 'purchase'
    )
  end

  def ensure_refund_rows
    refunds = Array(pay_charge.data&.dig('refunds', 'data')).presence ||
              Array(pay_charge.object&.dig('refunds', 'data'))

    refunds.each { |refund| record_refund(refund) }
  end

  def record_refund(refund)
    refund_id = refund['id']
    return if refund_id.blank?
    return if EventEntryPayment.exists?(stripe_refund_id: refund_id)

    amount_cents = refund['amount'].to_i
    return if amount_cents <= 0

    entries_refunded = amount_cents / EventEntryPayment::ENTRY_PRICE_CENTS
    return if entries_refunded <= 0

    EventEntryPayment.create!(
      payable: event,
      pay_charge: pay_charge,
      entries: -entries_refunded,
      amount_cents: -amount_cents,
      kind: 'refund',
      stripe_refund_id: refund_id
    )
  end
end
