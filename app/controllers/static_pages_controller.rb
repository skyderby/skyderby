# encoding: utf-8
class StaticPagesController < ApplicationController

  def index
    @track = Track.new
    @event = Event.new

    @coming_events = Event.limit(5).order("start_at asc")
  end

  def about
  end

  def upload_error
  end

end
