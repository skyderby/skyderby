module Profiles
  class MergesController < ApplicationController
    before_action :set_profile
    before_action :authorize_action

    def new; end

    def create
      other = Profile.find(merge_params[:other_profile_id])
      destination, source = flipped? ? [other, @profile] : [@profile, other]

      if destination.merge_with(source)
        render
      else
        respond_with_errors destination
      end
    end

    private

    def merge_params
      params.require(:profiles_merge).permit(:other_profile_id, :flip)
    end

    def flipped?
      ActiveModel::Type::Boolean.new.cast(merge_params[:flip])
    end

    def set_profile
      @profile = Profile.find(params[:profile_id])
    end

    def authorize_action
      return if ProfilePolicy.new(current_user, @profile).merge?

      raise Pundit::NotAuthorizedError
    end
  end
end
