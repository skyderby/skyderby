# encoding: utf-8
class EventsController < ApplicationController
  before_action :set_event, only:
    [:show, :finished, :update, :destroy, :results]

  def index
    @events = Event.available_for(current_user)
  end

  def new
    @event = Event.create(responsible: current_user.user_profile)
    redirect_to @event
  end

  def update
    if @event.update event_params
      redirect_to @event, notice: 'Данные успешно обновлены.'
    else
      redirect_to @event, notice: 'При сохранении произошла ошибка.'
    end
  end

  def show
  end

  def results
    render layout: 'full_screen'
  end

  def destroy
  end

  private

  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    params[:event].permit(:name, :place,
                          :range_from, :range_to,
                          :descriprion, :form_info, :dz_info,
                          :start_at, :end_at, :reg_starts, :reg_ends,
                          :merge_intermediate_and_rookie,
                          :allow_tracksuits, :finished)
  end
end
