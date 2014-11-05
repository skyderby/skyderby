# encoding: utf-8
class EventsController < ApplicationController
  before_action :set_event, only: [:show, :update, :destroy, :results]

  def index
    @event = Event.new
  end

  def create
    event_params = params[:event]
    @event = Event.new :name            => event_params[:name],
                       :place           => event_params[:place],
                       :start_at        => Date.parse(event_params[:start_at]),
                       :end_at          => Date.parse(event_params[:end_at]),
                       :comp_range_from => event_params[:comp_range_from],
                       :comp_range_to   => event_params[:comp_range_to]

    @event.organizers.build :user => current_user, :orgs_admin => true,
                            :rounds_admin => true, :competitors_admin => true,
                            :tracks_admin => true
    @event.save
    redirect_to @event, notice: 'Событие успешно создано.'
  end

  def update
    @event.update params[:event].permit(:name, :place,
                                        :comp_range_from, :comp_range_to,
                                        :descriprion, :form_info, :dz_info,
                                        :start_at, :end_at, :reg_starts, :reg_ends,
                                        :merge_intermediate_and_rookie,
                                        :allow_tracksuits)
    redirect_to @event, notice: 'Данные успешно обновлены.'
  end

  def show
    @round = Round.new
    @org = Organizer.new
    @doc = EventDocument.new
    @track = EventTrack.new
    @participation_form = ParticipationForm.new
    @results = @event.results
  end

  def results
    @results = @event.results
    render layout: 'full_screen'
  end

  def destroy
  end

  private
  def set_event
    @event = Event.find(params[:id])
  end
end
