class Profiles::GiftedSubscriptionsController < ApplicationController
  before_action :set_profile

  def new
    authorize @profile, :grant_subscription?

    @gifted_subscription = GiftedSubscription.new
  end

  def create
    authorize @profile, :grant_subscription?

    @gifted_subscription = @profile.owner.gifted_subscriptions.build(gifted_subscription_params)
    @gifted_subscription.granted_by = current_user

    if @gifted_subscription.save
      redirect_to profile_subscription_path(@profile), notice: 'Subscription granted successfully'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @profile, :grant_subscription?

    @gifted_subscription = GiftedSubscription.find(params[:id])
    @gifted_subscription.destroy

    redirect_to profile_subscription_path(@profile), notice: 'Subscription revoked'
  end

  private

  def set_profile
    @profile = Profile.find(params[:profile_id])
  end

  def gifted_subscription_params
    params.require(:gifted_subscription).permit(:expires_at, :reason)
  end
end
