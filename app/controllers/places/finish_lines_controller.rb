module Places
  class FinishLinesController < ApplicationController
    before_action :load_place
    before_action :load_finish_line, only: %i[show edit update destroy]

    def index
      @finish_lines = @place.finish_lines
    end

    def new
      @finish_line = @place.finish_lines.new
    end

    def create
      finish_line = @place.finish_lines.new(finish_line_params)

      respond_to do |format|
        if finish_line.save
          format.js { redirect_to place_finish_lines_path(@place) }
        else
          format.js { render 'errors/ajax_errors', locals: { errors: finish_line.errors } }
        end
      end
    end

    def show
      fresh_when etags_for(@finish_line)
    end

    def edit
    end

    def update
      respond_to do |format|
        if @finish_line.update(finish_line_params)
          format.js { redirect_to place_finish_lines_path(@place) }
        else
          format.js { render 'errors/ajax_errors', locals: { errors: @finish_line.errors } }
        end
      end
    end

    def destroy
      respond_to do |format|
        if @finish_line.destroy
          format.js { redirect_to place_finish_lines_path(@place) }
        else
          format.js { render 'errors/ajax_errors', locals: { errors: @finish_line.errors } }
        end
      end
    end

    private

    def load_place
      @place = Place.find(params[:place_id])
    end

    def load_finish_line
      @finish_line = @place.finish_lines.find(params[:id])
    end

    def finish_line_params
      params.require(:finish_line).permit(
        :name,
        :start_latitude,
        :start_longitude,
        :end_latitude,
        :end_longitude
      )
    end
  end
end
