# encoding: utf-8
class Events::SectionsController < ApplicationController
  include EventLoading

  before_action :set_section, only: [:update,
                                     :destroy,
                                     :edit,
                                     :move_upper,
                                     :move_lower]

  load_resource :event
  before_action :authorize_event

  load_and_authorize_resource :section, through: :event

  def create
    @section = @event.sections.new section_params

    if @section.save
      respond_to do |format|
        format.json
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors @section.errors
    end
  end

  def update
    if @section.update section_params
      respond_to do |format|
        format.json
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors @section.errors
    end
  end

  def destroy
    if @section.destroy
      respond_to do |format|
        format.json { head :no_content }
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors @section.errors
    end
  end

  def move_upper
    @section.move_upper
    unless @section.errors.present?
      respond_to do |format|
        format.json { head :ok }
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors @section.errors
    end
  end

  def move_lower
    @section.move_lower
    unless @section.errors.present?
      respond_to do |format|
        format.json { head :ok }
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors @section.errors
    end
  end

  def new
    @section = @event.sections.new
  end

  private

  def set_section
    @section = Section.find(params[:id])
  end

  def section_params
    params.require(:section).permit(:name, :event_id, :order)
  end

  def authorize_event
    authorize! :update, @event
  end
end
