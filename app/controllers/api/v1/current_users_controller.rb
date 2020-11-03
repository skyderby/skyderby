module Api
  module V1
    class CurrentUsersController < ApplicationController
      def show
        @user = Current.user
        @profile = Current.profile
      end
    end
  end
end
