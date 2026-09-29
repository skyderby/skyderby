module Api
  module V1
    module Profiles
      class CurrentsController < Api::ApplicationController
        before_action :require_registered_user!

        def show
          @user = current_user
          @profile = @user.profile
        end
      end
    end
  end
end
