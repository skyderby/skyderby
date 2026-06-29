module Profiles
  class BadgesController < ApplicationController
    before_action :set_profile
    before_action :ensure_can_manage_badges

    def new
      @badge = @profile.badges.new
    end

    def create
      @badge = @profile.badges.new(badge_params)

      if @badge.save
        render
      else
        respond_with_errors @badge
      end
    end

    private

    def set_profile
      @profile = Profile.find(params[:profile_id])
    end

    def ensure_can_manage_badges
      respond_not_authorized unless Badge.creatable?
    end

    def badge_params
      params.require(:badge).permit(:name, :kind, :category, :comment, :achieved_at)
    end
  end
end
