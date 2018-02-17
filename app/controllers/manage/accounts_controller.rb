module Manage
  class AccountsController < ApplicationController
    def index
      authorize User

      @accounts = User.includes(:profile)
                      .search(params[:search])
                      .order(:created_at)
                      .paginate(per_page: 25, page: params[:page])
    end

    def show
      @account = User.find(params[:id])

      authorize @account
    end
  end
end
