# encoding: utf-8
class WingsuitsController < ApplicationController

  def autocomplete
    query = params[:query].downcase
    event = Event.find(params[:event_id])
    suggestions = Wingsuit.suggestions_by_name query, event

    @response = {:query => query, :suggestions => suggestions}.to_json

    respond_to do |format|
      format.json { render :json => @response }
    end
  end

end
