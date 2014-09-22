# encoding: utf-8
class WingsuitsController < ApplicationController

  def autocomplete
    query = params[:query].downcase
    event_id = params[:event_id]
    if event_id.present?
      event = Event.find(event_id)
      suggestions = Wingsuit.suggestions_by_name query, event
    else
      suggestions = Wingsuit.suggestions_by_name query
    end

    @response = {:query => query, :suggestions => suggestions}.to_json

    respond_to do |format|
      format.json { render :json => @response }
    end
  end

end
