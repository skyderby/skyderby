# encoding: utf-8
class StaticPagesController < ApplicationController
  def index
    @track = Track.new
    @event = Event.new
  end

  def terms
  end

  def about
  end
end
