module Profiles
  class FollowsController < ApplicationController
    before_action :set_profile
    before_action :require_registered_user

    def create
      return respond_not_authorized unless @profile.followable?

      @profile.follow(user: Current.user)
      render_button
    end

    def destroy
      @profile.unfollow(user: Current.user)
      render_button
    end

    private

    def set_profile
      @profile = Profile.find(params[:profile_id])
    end

    def require_registered_user
      redirect_to new_user_session_path unless Current.user.registered?
    end

    def render_button
      render turbo_stream: turbo_stream.replace(
        helpers.dom_id(@profile, :follow),
        partial: 'profiles/follows/button',
        locals: { profile: @profile }
      )
    end
  end
end
