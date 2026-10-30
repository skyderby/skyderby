module Api
  module V1
    module GooglePlay
      class PurchasesController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }
        before_action :forbid_impersonation!

        rescue_from GooglePlayPurchase::InvalidError do |exception|
          render_errors [exception.message], status: :unprocessable_content
        end

        rescue_from GooglePlayPurchase::Publisher::UnavailableError do |exception|
          render_errors [exception.message], status: :service_unavailable
        end

        rescue_from ActiveRecord::RecordInvalid do |exception|
          render_errors exception.record.errors.full_messages, status: :unprocessable_content
        end

        def create
          raise GooglePlayPurchase::InvalidError, 'Unexpected package name' unless package_name_matches?

          verification = GooglePlayPurchase::Verification.fetch(
            product_id: params.require(:product_id), purchase_token: params.require(:purchase_token)
          )
          GooglePlayPurchase.record!(verification, user: current_user)

          @subscription = current_user.subscription
        end

        private

        def package_name_matches?
          params[:package_name].blank? || params[:package_name] == GooglePlayPurchase::PACKAGE_NAME
        end
      end
    end
  end
end
