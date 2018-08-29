module Api
  module V1
    module Profiles
      class CurrentsController < ApplicationController
        def show
          @profile = Current.profile

          raise Pundit::NotAuthorizedError unless @profile.present?

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
