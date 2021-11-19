module Api
  module V1
    class UsersController < Api::ApplicationController
      def index
        authorize User

        @users =
          User
          .includes(:profile)
          .search(params[:search_term])
          .paginate(page: current_page, per_page: 25)
      end
    end
  end
end
