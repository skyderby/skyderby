class StaticPagesController < ApplicationController
  def index
    if user_signed_in? && Current.profile
      @dashboard = Profiles::Dashboard.new(
        Current.profile,
        user: Current.user,
        mode: params[:mode],
        modes: Profiles::Dashboard::HOME_MODES
      )
    else
      @track_file = Track::File.new
      @page = LandingPage.new
    end
  end

  def manage
    authorize! :manage, :all
  end

  def site_webmanifest; end
end
