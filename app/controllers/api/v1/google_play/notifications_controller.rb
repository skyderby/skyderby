module Api
  module V1
    module GooglePlay
      class NotificationsController < Api::ApplicationController
        skip_before_action :reject_invalid_token

        def create
          return head :unauthorized unless GooglePlayPurchase::PushAuthorization.valid?(request.authorization)

          GooglePlayPurchase::Notification.new(params.require(:message).permit(:data, :messageId).to_h).process
          head :no_content
        rescue GooglePlayPurchase::Publisher::UnavailableError
          head :service_unavailable
        end
      end
    end
  end
end
