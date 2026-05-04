class PaymentsController < ApplicationController
  PAYABLE_CLASSES = [PerformanceCompetition, SpeedSkydivingCompetition, Tournament].freeze

  before_action :authenticate_user!
  before_action :set_payable
  before_action :authorize_payable!

  def show
    @paid_seats = @payable.paid_seats
    @competitors_count = @payable.competitors.count
    @seat_payments = @payable.seat_payments.includes(:pay_charge)
    assign_event_ivar
  end

  def create
    seats = params[:seats].to_i

    if seats < 1
      redirect_to polymorphic_path([@payable, :payments]),
                  alert: t('event_payments.errors.invalid_seats')
      return
    end

    checkout_session = current_user.payment_processor.checkout(
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: t('event_payments.product_name', event: @payable.name)
          },
          unit_amount: EventSeatPayment::SEAT_PRICE_CENTS
        },
        quantity: seats
      }],
      payment_intent_data: {
        metadata: {
          type: EventSeatPayment::CHARGE_TYPE,
          event_type: @payable.class.name,
          event_id: @payable.id,
          seats: seats
        }
      },
      success_url: polymorphic_url([:success, @payable, :payments]),
      cancel_url: polymorphic_url([@payable, :payments])
    )

    redirect_to checkout_session.url, allow_other_host: true, status: :see_other
  end

  def success
    redirect_to polymorphic_path([@payable, :payments]), notice: t('event_payments.success')
  end

  private

  def assign_event_ivar
    @event = @payable
    @tournament = @payable
  end

  def set_payable
    @payable = payable_class.find(params["#{payable_class.name.underscore}_id"])
  end

  def payable_class
    @payable_class ||= PAYABLE_CLASSES.detect { |c| params["#{c.name.underscore}_id"] }
  end

  def authorize_payable!
    respond_not_authorized unless @payable.editable? && @payable.billable?
  end
end
