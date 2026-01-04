class Profiles::SubscriptionsController < ApplicationController
  before_action :set_profile

  def show
    authorize @profile, :subscription?

    @user = @profile.owner
    @gifted_subscriptions = @user.gifted_subscriptions.order(created_at: :desc)
    @pay_customer = @user.stripe_processor
    @charges = @pay_customer&.charges&.order(created_at: :desc) || []
    @subscriptions = @pay_customer&.subscriptions&.order(created_at: :desc) || []
  end

  private

  def set_profile
    @profile = Profile.find(params[:profile_id])
  end
end
