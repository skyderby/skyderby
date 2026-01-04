class Users::SessionsController < Devise::SessionsController
  def create
    super do |user|
      Amplitude.identify(user_id: user.id, properties: { plan: user.subscription_plan })
    end
  end
end
