module SubscriptionsHelper
  SUBSCRIPTION_STATUS_COLORS = {
    'lifetime' => 'blue',
    'active' => 'green',
    'past_due' => 'red',
    'trialing' => 'purple'
  }.freeze

  def subscription_status_badge(subscription)
    status = subscription.status
    color = SUBSCRIPTION_STATUS_COLORS.fetch(status.to_s, 'gray')

    tag.span(status, class: "badge badge-#{color}")
  end
end
