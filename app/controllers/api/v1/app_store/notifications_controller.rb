module Api
  module V1
    module AppStore
      class NotificationsController < Api::ApplicationController
        def create
          AppStorePurchase::Notification.new(params.require(:signed_payload)).process
          head :ok
        rescue AppStorePurchase::SignedPayload::InvalidError => e
          render_errors [e.message], status: :unprocessable_content
        end
      end
    end
  end
end
