module Api
  module V1
    module Profiles
      class CurrentsController < ApplicationController
        def show
          @profile = Current.profile

          raise Pundit::NotAuthorizedError if @profile.blank?

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
