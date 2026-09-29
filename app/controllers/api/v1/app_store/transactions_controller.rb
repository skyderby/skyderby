module Api
  module V1
    module AppStore
      class TransactionsController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }
        before_action :forbid_impersonation!

        def create
          transaction = AppStorePurchase::Transaction.from_jws(params.require(:signed_transaction))
          AppStorePurchase.record!(transaction, user: current_user)

          @subscription = current_user.subscription
        rescue AppStorePurchase::SignedPayload::InvalidError => e
          render_errors [e.message], status: :unprocessable_content
        rescue ActiveRecord::RecordInvalid => e
          render_errors e.record.errors.full_messages, status: :unprocessable_content
        end
      end
    end
  end
end
