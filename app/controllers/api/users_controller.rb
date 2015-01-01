module Api
  class UsersController < ApplicationController

    def autocomplete

      @response = User.suggestions_by_name params[:query].downcase

      respond_to do |format|
        format.json { render :json => @response }
      end

    end

  end
end