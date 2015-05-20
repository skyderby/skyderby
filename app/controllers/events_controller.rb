# encoding: utf-8
class EventsController < ApplicationController
  before_action :set_event, only:
    [:show, :finished, :update, :destroy, :results]

  load_and_authorize_resource

  def index
    @events = EventsFinder.new.execute(current_user)
  end

  def new
    @event = Event.create(responsible: current_user.user_profile)
    redirect_to @event
  end

  def update
    if @event.update event_params
      @event
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def show
  end

  def destroy
  end

  private

  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    params[:event].permit(
      :name,
      :place_id,
      :range_from,
      :range_to,
      :status
    )
  end
end
