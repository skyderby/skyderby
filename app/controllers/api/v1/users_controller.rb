module Api
  module V1
    class UsersController < Api::ApplicationController
      def index
        authorize User

        @users =
          User
          .includes(:profile)
          .order(:created_at)
          .search(params[:search_term])
          .paginate(page: current_page, per_page: 25)
      end

      def show
        authorize User

        @user = User.find(params[:id])
      end
    end
  end
end
