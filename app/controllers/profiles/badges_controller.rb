module Profiles
  class BadgesController < ApplicationController
    before_action :set_profile

    def new
      authorize :badge, :new?

      @badge = @profile.badges.new
    end

    def create
      authorize :badge, :create?

      @badge = @profile.badges.new(badge_params)

      respond_to do |format|
        if @badge.save
          format.js
        else
          format.js { render 'errors/ajax_errors', locals: { errors: @badge.errors } }
        end
      end
    end

    private

    def set_profile
      @profile = Profile.find(params[:profile_id])
    end

    def badge_params
      params.require(:badge).permit(:name, :kind, :category, :comment)
    end
  end
end
