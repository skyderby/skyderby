require 'test_helper'

class EventSeatPaymentTest < ActiveSupport::TestCase
  setup do
    @event = speed_skydiving_competitions(:nationals)
    @user = users(:regular_user)
    @customer = Pay::Customer.create!(
      owner: @user,
      processor: 'stripe',
      processor_id: "cus_test_#{SecureRandom.hex(4)}"
    )
  end

  def build_charge(metadata:, processor_id: nil, amount: 1500, refunds: [])
    Pay::Charge.create!(
      customer: @customer,
      processor_id: processor_id || "ch_test_#{SecureRandom.hex(6)}",
      amount: amount,
      currency: 'usd',
      amount_refunded: refunds.sum { |r| r['amount'] },
      data: { 'refunds' => { 'data' => refunds } },
      metadata: metadata
    )
  end

  test 'reconciler creates a purchase row for a paid charge' do
    assert_difference -> { EventSeatPayment.count } => 1 do
      build_charge(
        metadata: {
          'type' => 'event_seats',
          'event_type' => 'SpeedSkydivingCompetition',
          'event_id' => @event.id,
          'seats' => 3
        },
        amount: 4500
      )
    end

    payment = EventSeatPayment.last
    assert_equal 'purchase', payment.kind
    assert_equal 3, payment.seats
    assert_equal 4500, payment.amount_cents
    assert_equal @event, payment.payable
  end

  test 'reconciler is idempotent on repeated saves' do
    charge = build_charge(
      metadata: {
        'type' => 'event_seats',
        'event_type' => 'SpeedSkydivingCompetition',
        'event_id' => @event.id,
        'seats' => 2
      },
      amount: 3000
    )

    assert_no_difference -> { EventSeatPayment.where(kind: 'purchase').count } do
      charge.update!(amount_refunded: 0)
      charge.touch
    end
  end

  test 'reconciler ignores non-event_seats charges' do
    assert_no_difference -> { EventSeatPayment.count } do
      build_charge(metadata: { 'type' => 'lifetime' }, amount: 5900)
    end
  end

  test 'reconciler records refund as negative seats' do
    refund = { 'id' => 're_test_123', 'amount' => 1500 }
    charge = build_charge(
      metadata: {
        'type' => 'event_seats',
        'event_type' => 'SpeedSkydivingCompetition',
        'event_id' => @event.id,
        'seats' => 3
      },
      amount: 4500
    )

    assert_difference -> { EventSeatPayment.where(kind: 'refund').count } => 1 do
      charge.data = { 'refunds' => { 'data' => [refund] } }
      charge.amount_refunded = 1500
      charge.save!
    end

    refund_row = EventSeatPayment.find_by(stripe_refund_id: 're_test_123')
    assert_equal(-1, refund_row.seats)
    assert_equal(-1500, refund_row.amount_cents)
  end

  test 'reconciler is idempotent on repeated refund webhooks' do
    refund = { 'id' => 're_test_999', 'amount' => 1500 }
    charge = build_charge(
      metadata: {
        'type' => 'event_seats',
        'event_type' => 'SpeedSkydivingCompetition',
        'event_id' => @event.id,
        'seats' => 3
      },
      amount: 4500,
      refunds: [refund]
    )

    assert_no_difference -> { EventSeatPayment.where(kind: 'refund').count } do
      charge.touch
      charge.save!
    end
  end

  test 'paid_seats sums purchases and refunds' do
    build_charge(
      metadata: {
        'type' => 'event_seats',
        'event_type' => 'SpeedSkydivingCompetition',
        'event_id' => @event.id,
        'seats' => 5
      },
      amount: 7500,
      refunds: [{ 'id' => 're_x', 'amount' => 3000 }]
    )

    assert_equal 3, @event.paid_seats
  end
end
