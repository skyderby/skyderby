module Api
  class UsersController < ApplicationController
    def autocomplete
      @response = User.suggestions_by_name params[:query].downcase
      render json: @response
    end
  end
end
