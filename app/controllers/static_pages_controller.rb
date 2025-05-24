class StaticPagesController < ApplicationController
  def index
    @track_file = Track::File.new
    @page = LandingPage.new

    if Current.user.admin?
      @dashboard = Current.user.dashboard
      # render :dashboard
    else
      render
    end
  end

  def manage
    authorize! :manage, :all
  end

  def site_webmanifest; end

  def about; end
end
