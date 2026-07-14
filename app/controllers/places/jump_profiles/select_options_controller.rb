class Places::JumpProfiles::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @jump_lines = Place::JumpLine.includes(:place)
                                 .order('places.name, place_jump_lines.name')

    @jump_lines = if params[:place_id].present?
                    @jump_lines.where(place_id: params[:place_id]).joins(:measurements).distinct
                  else
                    @jump_lines.search(params[:term])
                  end

    @jump_lines = @jump_lines.page(page).per(25)

    respond_with_no_results(params[:frame_id]) if @jump_lines.empty? && @jump_lines.current_page == 1
  end
end
