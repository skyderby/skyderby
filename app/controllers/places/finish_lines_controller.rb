module Places
  class FinishLinesController < ApplicationController
    before_action :load_place
    before_action :load_finish_line, only: %i[show edit update destroy]

    def index
      @finish_lines = @place.finish_lines
    end

    def new
      return respond_not_authorized unless Place::FinishLine.creatable?

      @finish_line = @place.finish_lines.new
    end

    def create
      return respond_not_authorized unless Place::FinishLine.creatable?

      finish_line = @place.finish_lines.new(finish_line_params)

      if finish_line.save
        redirect_to place_finish_lines_path(@place)
      else
        respond_with_errors(finish_line)
      end
    end

    def show
      fresh_when @finish_line
    end

    def edit
      respond_not_authorized unless @finish_line.editable?
    end

    def update
      return respond_not_authorized unless @finish_line.editable?

      if @finish_line.update(finish_line_params)
        redirect_to place_finish_lines_path(@place)
      else
        respond_with_errors(@finish_line)
      end
    end

    def destroy
      return respond_not_authorized unless @finish_line.deletable?

      if @finish_line.destroy
        redirect_to place_finish_lines_path(@place)
      else
        respond_with_errors(@finish_line)
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
      params.require(:place_finish_line).permit(
        :name,
        :start_latitude,
        :start_longitude,
        :end_latitude,
        :end_longitude
      )
    end
  end
end
