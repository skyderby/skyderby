# encoding: utf-8
class EventsController < ApplicationController
  include EventLoading

  before_action :set_event, only:
    [:edit, :update, :destroy]

  load_and_authorize_resource

  def index
    tournaments = Tournament.includes(place: :country).all.to_a
    events = EventsFinder.new.execute(current_user).to_a

    @events = (tournaments + events).sort_by { |x| x.starts_at }.reverse

    @event = Event.new
  end

  def create
    @event = Event.new event_params
    @event.responsible = current_user.profile
    if @event.save
      respond_to do |format|
        format.html { redirect_to @event }
        format.js
      end
    else
      redirect_to events_path
    end
  end

  def update
    if @event.update event_params
      if @event.previous_changes.key? :wind_cancellation
        redirect_to event_path(@event)
      else
        @event
      end
    else
      respond_with_errors(@event.errors)
    end
  end

  def show
    load_event(params[:id])
    @scoreboard = Events::ScoreboardFactory.new(@event).create
  end

  def destroy
  end

  def edit
  end

  private

  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    params[:event].permit(
      :name,
      :starts_at,
      :rules,
      :place_id,
      :range_from,
      :range_to,
      :status,
      :wind_cancellation
    )
  end
end
