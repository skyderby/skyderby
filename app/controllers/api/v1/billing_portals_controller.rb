module Api
  module V1
    class BillingPortalsController < Api::ApplicationController
      before_action -> { doorkeeper_authorize! :write }
      before_action :require_registered_user!
      before_action :forbid_impersonation!

      def create
        portal = current_user.payment_processor.billing_portal(return_url: subscriptions_url)
        render json: { url: portal.url }
      end
    end
  end
end
