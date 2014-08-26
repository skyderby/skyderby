class EventsController < ApplicationController
  before_action :set_event, only: [:show, :edit, :update, :destroy]

  def index
  end

  def create
    @event = Event.new :name            => params['name'],
                       :place           => params[:place],
                       #:start_at        => params[:start_at],
                       #:end_at          => params[:end_at],
                       :comp_range_from => params[:comp_range_from],
                       :comp_range_to   => params[:comp_range_to]

    @event.save
    redirect_to event_path(@event)
  end

  def show
    @round = Round.new
    @org = Organizer.new
    @participation_form = ParticipationForm.new
  end

  def destroy

  end

  private
  def set_event
    @event = Event.find(params[:id])
  end
end
