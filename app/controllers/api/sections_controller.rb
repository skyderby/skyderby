module Api
  class SectionsController < ApplicationController
    before_action :set_section, only: [:update, :destroy]

    def create
      @section = Section.new section_params

      respond_to do |format|
        if @section.save
          format.json { render json: {id: @section.id, name: @section.name}, status: :ok }
        else
          format.json { render json: @section.errors, status: :unprocessable_entity }
        end
      end
    end

    def update
      respond_to do |format|
        if @section.update section_params
          format.json { render json: {:id => @section.id, :name => @section.name}, status: :ok }
        else
          format.json { render json: @section.errors, status: :unprocessable_entity }
        end
      end
    end

    def destroy
      @section.destroy

      respond_to do |format|
        format.json { head :no_content }
      end
    end

    def reorder
      params[:sections].each do |_, x|
        @section = Section.find(x[:section_id])
        @section.update(order: x[:order])
      end

      respond_to do |format|
        format.json { head :no_content }
      end
    end

    private

    def set_section
      @section = Section.find(params[:id])
    end

    def section_params
      params.require(:section).permit(:name, :event_id)
    end
  end
end
