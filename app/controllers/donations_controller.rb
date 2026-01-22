class DonationsController < ApplicationController
  before_action :authorize!

  def index
    @donations = Contribution.includes(details: :profile).page(page).per(25).order(received_at: :desc)
  end

  def new
    @donation = Contribution.new
    @donation.details.build
  end

  def create
    @donation = Contribution.new(donation_params)

    if @donation.save
      redirect_to donations_path, notice: 'Donation was successfully created.'
    else
      respond_with_errors(@donation)
    end
  end

  private

  def donation_params
    params.require(:donation).permit(:amount, :received_at, details_attributes: [:profile_id])
  end

  def authorize!
    respond_not_authorized unless current_user.admin?
  end
end
