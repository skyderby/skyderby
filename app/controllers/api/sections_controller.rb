module Api
  class SectionsController < ApplicationController
    before_action :set_section, only: [:update, :destroy]

    def create
      @section = Section.new section_params

      if @section.save
        @section
      else
        render json: @section.errors, status: :unprocessable_entity
      end
    end

    def update
      if @section.update section_params
        @section
      else
        render json: @section.errors, status: :unprocessable_entity
      end
    end

    def destroy
      @section.destroy
      head :no_content
    end

    def reorder
      params[:sections].each do |_, x|
        @section = Section.find(x[:section_id])
        @section.update(order: x[:order])
      end

      head :no_content
    end

    private

    def set_section
      @section = Section.find(params[:id])
    end

    def section_params
      params.require(:section).permit(:name, :event_id, :order)
    end
  end
end
