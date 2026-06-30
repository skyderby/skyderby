class Profiles::SubscriptionsController < ApplicationController
  before_action :set_profile
  before_action :ensure_manageable_subscription

  def show
    @profile = Profiles::SubscriptionAdmin.new(@profile)
  end

  private

  def set_profile
    @profile = Profile.find(params[:profile_id])
  end

  def ensure_manageable_subscription
    respond_not_authorized unless @profile.manageable_subscription?
  end
end
