class Places::JumpProfiles::SelectOptionsController < ApplicationController
  layout false

  def index
    @jump_lines = Place::JumpLine.includes(:place)
                                 .order('places.name, place_jump_lines.name')
                                 .search(params[:term])
                                 .paginate(page:, per_page: 25)
  end
end
