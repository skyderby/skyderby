class SponsorsController < ApplicationController
  include SponsorableContext

  before_action :set_sponsorable
  before_action :authorize_sponsorable

  def new
    @sponsor = Sponsor.new
  end

  def create
    @sponsor = @sponsorable.sponsors.new sponsor_params

    if @sponsor.save
      broadcast_sponsors_update
    else
      respond_with_error @sponsor
    end
  end

  def destroy
    @sponsor = Sponsor.find(params[:id])

    if @sponsor.destroy
      broadcast_sponsors_update
    else
      respond_with_error @sponsor
    end
  end

  private

  def sponsor_params
    params.require(:sponsor).permit(:name, :website, :logo, :event_id)
  end
end
