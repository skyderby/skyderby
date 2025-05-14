module Profiles
  class BadgesController < ApplicationController
    before_action :set_profile

    def new
      authorize :badge, :new?

      @badge = @profile.badges.new

      respond_to do |format|
        format.turbo_stream
      end
    end

    def create
      authorize :badge, :create?

      @badge = @profile.badges.new(badge_params)

      if @badge.save
        respond_to do |format|
          format.turbo_stream
        end
      else
        respond_with_errors @badge
      end
    end

    private

    def set_profile
      @profile = Profile.find(params[:profile_id])
    end

    def badge_params
      params.require(:badge).permit(:name, :kind, :category, :comment, :achieved_at)
    end
  end
end
