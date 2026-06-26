class Profiles::NameOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @options = Profile.name_options(params[:term])

    respond_with_no_results(params[:frame_id]) if @options.empty?
  end
end
