# encoding: utf-8
class StaticPagesController < ApplicationController
  def index
    @track = Track.new
  end

  def manage
    authorize! :manage, :all
  end

  def terms
  end

  def about
  end
end
