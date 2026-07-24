class Landing::FeaturedChartsController < ApplicationController
  layout false

  def show
    redirect_to root_path unless turbo_frame_request?
  end
end
