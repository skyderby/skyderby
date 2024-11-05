class Api::Web::CurrentUsersController < Api::Web::ApplicationController
  def show
    @user = Current.user
    @profile = Current.profile
  end
end
