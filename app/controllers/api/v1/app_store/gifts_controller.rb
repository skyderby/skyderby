module Api
  module V1
    module AppStore
      class GiftsController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }
        before_action :forbid_impersonation!

        rescue_from AppStorePurchase::SignedPayload::InvalidError do |exception|
          render_errors [exception.message], status: :unprocessable_content
        end

        rescue_from ActiveRecord::RecordInvalid do |exception|
          render_errors exception.record.errors.full_messages, status: :unprocessable_content
        end

        def create
          recipient = gift_recipient
          transaction = AppStorePurchase::Transaction.from_jws(params.require(:signed_transaction))
          @gift = GiftedSubscription.purchase_from_app_store!(
            transaction, buyer: current_user, recipient:, message: params[:message]
          )
        end

        private

        def gift_recipient
          profile = Profile.find(params.require(:recipient_profile_id))
          unless profile.belongs_to_user?
            raise AppStorePurchase::SignedPayload::InvalidError,
                  'This profile has no account'
          end
          if profile.owner == current_user
            raise AppStorePurchase::SignedPayload::InvalidError,
                  'You cannot gift Pro to yourself'
          end

          profile.owner
        end
      end
    end
  end
end
