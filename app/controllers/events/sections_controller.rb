module Events
  class SectionsController < ApplicationController
    include EventScoped

    before_action :set_event
    before_action :authorize_event
    before_action :set_section, only: [:update,
                                       :destroy,
                                       :edit,
                                       :move_upper,
                                       :move_lower]

    def create
      @section = @event.sections.new section_params

      if @section.save
        respond_to do |format|
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors @section.errors
      end
    end

    def update
      if @section.update section_params
        respond_to do |format|
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors @section.errors
      end
    end

    def destroy
      if @section.destroy
        respond_to do |format|
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors @section.errors
      end
    end

    def move_upper
      @section.move_upper
      if @section.errors.blank?
        respond_to do |format|
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors @section.errors
      end
    end

    def move_lower
      @section.move_lower
      if @section.errors.blank?
        respond_to do |format|
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
      @section = @event.sections.find(params[:id])
    end

    def section_params
      params.require(:section).permit(:name, :event_id, :order)
    end
  end
end
