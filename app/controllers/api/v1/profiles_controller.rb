module Api
  module V1
    class ProfilesController < ApplicationController
      def show
        @profile = Profile.find(params[:id])
      end
    end
  end
end
