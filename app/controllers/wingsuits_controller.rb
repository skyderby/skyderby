class WingsuitsController < ApplicationController

  def autocomplete
    query = params[:query].downcase
    suggestions = Wingsuit.suggestions_by_name query

    @response = {:query => query, :suggestions => suggestions}.to_json

    respond_to do |format|
      format.json { render :json => @response }
    end
  end

end
