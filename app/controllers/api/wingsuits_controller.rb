module Api
  class WingsuitsController < ApplicationController
    
    def index
      if params[:query] && params[:query][:term]
        @wingsuits = Wingsuit.includes(:manufacturer).where('LOWER(name) LIKE LOWER(?)', "%#{params[:query][:term]}%")
      else
        @wingsuits = Wingsuit.includes(:manufacturer).order(:name)
      end
    end

    def autocomplete
      query = params[:query].downcase
      suggestions = Wingsuit.suggestions_by_name query

      @response = {:query => query, :suggestions => suggestions}.to_json

      respond_to do |format|
        format.json { render :json => @response }
      end
    end

  end
end
