Pay.setup do |config|
  config.business_name = 'Kunin Tech Limited'
  config.business_address = ''
  config.application_name = 'Skyderby'

  config.default_product_name = 'Skyderby Premium'
  config.default_plan_name = 'Premium'

  config.automount_routes = true
  config.routes_path = '/pay'

  config.enabled_processors = [:stripe]
end

Rails.application.config.to_prepare do
  Pay::Subscription.include Pay::SubscriptionExtensions
  Pay::Charge.include Pay::ChargeExtensions
end
