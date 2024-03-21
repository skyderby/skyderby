module Api
  module V1
    class UsersController < Api::ApplicationController
      before_action :set_user, only: %i[show destroy]

      def index
        authorize User

        @users =
          User
          .includes(:profile)
          .order(created_at: :desc)
          .search(params[:search_term])
          .paginate(page: current_page, per_page: 25)
      end

      def show
        authorize User
      end

      def destroy
        authorize User

        destroy_profile = params[:destroy_profile] == 'true'
        User.transaction do
          @user.profile.destroy if destroy_profile
          @user.destroy if @user.profile.destroyed? || !destroy_profile
        end

        if @user.destroyed? && (@user.profile.destroyed? || !destroy_profile)
          head :ok
        else
          @user.errors.merge!(@user.profile.errors)
          respond_with_errors(@user.errors)
        end
      end

      private

      def set_user
        @user = User.find(params[:id])
      end
    end
  end
end
