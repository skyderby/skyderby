class Places::JumpProfiles::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @jump_lines = Place::JumpLine.includes(:place)
                                 .order('places.name, place_jump_lines.name')
                                 .search(params[:term])
                                 .paginate(page:, per_page: 25)

    respond_with_no_results(params[:frame_id]) if @jump_lines.empty? && @jump_lines.current_page == 1
  end
end
