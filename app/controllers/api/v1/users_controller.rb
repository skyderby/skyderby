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

        User.transaction do
          @user.profile.destroy! if params[:destroy_profile] == 'true'
          @user.destroy!
        end
      end

      private

      def set_user
        @user = User.find(params[:id])
      end
    end
  end
end
