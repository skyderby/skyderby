module Api
  module V1
    class DashboardsController < Api::ApplicationController
      MODES = ::Profiles::Dashboard::ACTIVITY_BY_MODE.keys.freeze

      before_action :require_registered_user!
      before_action -> { doorkeeper_authorize! :write }, only: :update
      before_action :require_profile

      def show
        @dashboard = build_dashboard(mode: params[:mode], rankings_gender: params[:rankings_gender])
      end

      def update
        current_user.setting.update_dashboard_preferences(profile:, **preference_params)
        @dashboard = build_dashboard(mode: params[:mode], rankings_gender: params[:rankings_gender])
        render :show
      end

      private

      def profile = current_user.profile

      def require_profile
        render_errors(['Profile not found'], status: :not_found) unless profile
      end

      def build_dashboard(mode:, rankings_gender:)
        ::Profiles::Dashboard.new(
          profile,
          user: current_user,
          mode:,
          rankings_gender:,
          modes: MODES
        )
      end

      def preference_params
        params.permit(:mode, :rankings_gender, :journal_period).to_h.symbolize_keys
      end
    end
  end
end
