module Api
  module V1
    module GooglePlay
      class GiftsController < Api::ApplicationController
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
          recipient = gift_recipient
          verification = GooglePlayPurchase::Verification.fetch(
            product_id: params.require(:product_id), purchase_token: params.require(:purchase_token)
          )
          @gift = GiftedSubscription.purchase_from_google_play!(
            verification, buyer: current_user, recipient:, message: params[:message]
          )
        end

        private

        def gift_recipient
          profile = Profile.find(params.require(:recipient_profile_id))
          raise GooglePlayPurchase::InvalidError, 'This profile has no account' unless profile.belongs_to_user?
          raise GooglePlayPurchase::InvalidError, 'You cannot gift Pro to yourself' if profile.owner == current_user

          profile.owner
        end
      end
    end
  end
end
