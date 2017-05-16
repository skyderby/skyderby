module Profiles
  class MergesController < ApplicationController
    before_action :set_destination_profile
    before_action :authorize_action

    def new
      respond_to do |format|
        format.js
      end
    end

    def create
      result = ProfileMerge.new(
        source: Profile.find(merge_params[:source_profile_id]),
        destination: @destination_profile
      ).execute

      respond_to do |format|
        if result.success?
          format.js
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: errors },
                   status: :unprocessable_entity
          end
        end
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
