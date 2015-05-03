module Api
  class WingsuitsController < ApplicationController
    def index
      @wingsuits = Wingsuit.includes(:manufacturer).order(:name)

      if params[:query] && params[:query][:term]
        @wingsuits = @wingsuits.search(params[:query][:term]) if params[:query][:term]
      end
    end
  end
end
