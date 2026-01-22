module Manage
  class AccountsController < ApplicationController
    def index
      authorize User

      @accounts = User.includes(:profile)
                      .search(params[:search])
                      .order(:created_at)
                      .page(page).per(25)
    end

    def show
      @account = User.find(params[:id])

      authorize @account
    end
  end
end
