class Profiles::SubscriptionsController < ApplicationController
  before_action :set_profile
  before_action :ensure_manageable_subscription

  def show
    @user = @profile.owner
    @gifted_subscriptions = @user.gifted_subscriptions.order(created_at: :desc)
    @pay_customer = @user.stripe_processor
    @charges = @pay_customer&.charges&.order(created_at: :desc) || []
    @subscriptions = @pay_customer&.subscriptions&.order(created_at: :desc) || []
    @contributions = @profile.contributions.order(received_at: :desc)
  end

  private

  def set_profile
    @profile = Profile.find(params[:profile_id])
  end

  def ensure_manageable_subscription
    respond_not_authorized unless @profile.manageable_subscription?
  end
end
