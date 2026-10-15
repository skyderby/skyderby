module Api
  module V1
    module Profiles
      class FollowsController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }
        before_action :require_registered_user!

        def create
          profile = Profile.find(params[:profile_id])
          return render_not_followable unless profile.followable?(current_user)

          profile.follow(user: current_user)
          render json: { followed: true }
        end

        def destroy
          Profile.find(params[:profile_id]).unfollow(user: current_user)
          render json: { followed: false }
        end

        private

        def render_not_followable = render_errors(['Not followable'], status: :unprocessable_content)
      end
    end
  end
end
