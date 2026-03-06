class GiftSubscriptionMailer < ApplicationMailer
  def gift_received(gifted_subscription)
    @gifted_subscription = gifted_subscription
    @recipient = gifted_subscription.user
    @gifter = gifted_subscription.granted_by

    mail(
      to: @recipient.email,
      subject: I18n.t('gift_subscription_mailer.gift_received.subject')
    )
  end
end
