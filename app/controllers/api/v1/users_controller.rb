module Api
  module V1
    class UsersController < Api::ApplicationController
      before_action :require_registered_user!

      def index
        @users =
          if params[:term].to_s.strip.length < 2
            User.none
          else
            User.includes(:profile).search_by_name(params[:term].strip).where.not(id: current_user.id)
                .order('profiles.name').limit(25)
          end
      end
    end
  end
end
