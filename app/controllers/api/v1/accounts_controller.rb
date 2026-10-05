module Api
  module V1
    class AccountsController < Api::ApplicationController
      before_action -> { doorkeeper_authorize! :write }
      before_action :require_registered_user!, :forbid_impersonation!

      def destroy
        current_user.delete_account!
        head :no_content
      end
    end
  end
end
