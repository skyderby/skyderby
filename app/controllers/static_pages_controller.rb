class StaticPagesController < ApplicationController
  def index
    @track_file = Track::File.new
    @page = LandingPage.new
  end

  def manage
    authorize! :manage, :all
  end

  # End point for NewRelic availability monitoring
  def ping
    head :ok
  end

  def about; end
end
