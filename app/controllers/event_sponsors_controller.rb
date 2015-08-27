class EventSponsorsController < ApplicationController
  before_action :set_event_sponsor, only: [:destroy]

  load_resource :event
  before_filter :authorize_event

  load_and_authorize_resource :event_sponsor, through: :event

  def create
    @event_sponsor = @event.event_sponsors.new event_sponsor_params

    if @event_sponsor.save
      @event_sponsor
    else
      render json: @event_sponsor.errors, status: :unprocessible_entry
    end
  end

  def destroy
    @event_sponsor.destroy
    head :no_content
  end

  private

  def set_event_sponsor
    @event_sponsor = EventSponsor.find(params[:id])
  end

  def event_sponsor_params
    params.require(:event_sponsor).permit(:name, :website, :logo, :event_id)
  end

  def authorize_event
    authorize! :update, @event
  end
end
