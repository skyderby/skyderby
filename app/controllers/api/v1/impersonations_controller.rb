module Api
  module V1
    class ImpersonationsController < Api::ApplicationController
      before_action -> { doorkeeper_authorize! :write }, only: :create
      before_action -> { doorkeeper_authorize! }, only: :destroy
      before_action :forbid_impersonation!, :require_admin!, only: :create

      def create
        @impersonation = Impersonation.start!(
          admin: current_user, user: target_user, application: doorkeeper_token.application
        )
        @profile = @impersonation.user.profile
        render :show, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render_errors e.record.errors.full_messages, status: :unprocessable_content
      end

      def destroy
        return render_errors(['Not impersonating'], status: :not_found) unless impersonation

        impersonation.finish!
        head :no_content
      end

      private

      def target_user
        if params[:profile_id].present?
          Profile.where(owner_type: 'User').find(params[:profile_id]).owner
        else
          User.find(params.require(:user_id))
        end
      end
    end
  end
end
