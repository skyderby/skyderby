module Profiles
  class MergesController < ApplicationController
    before_action :set_destination_profile
    before_action :authorize_action

    def new; end

    def create
      source_profile = Profile.find(merge_params[:source_profile_id])

      if @destination_profile.merge_with(source_profile)
        render
      else
        respond_with_errors @destination_profile
      end
    end

    private

    def merge_params
      params.require(:profiles_merge).permit(:source_profile_id)
    end

    def set_destination_profile
      @destination_profile = Profile.find(params[:profile_id])
    end

    def authorize_action
      return if ProfilePolicy.new(current_user, @destination_profile).merge?

      raise Pundit::NotAuthorizedError
    end
  end
end
