module Sponsors
  class SponsorsCopiesController < ApplicationController
    include SponsorableContext

    before_action :set_sponsorable
    before_action :authorize_sponsorable

    def new; end

    def create
      SponsorsCopyService.new.call(
        source: sponsorable_class.find(copy_params[:source_event_id]),
        target: @sponsorable
      )

      broadcast_sponsors_update
    end

    private

    def copy_params
      params.require(:sponsor_copy).permit(:source_event_id)
    end
  end
end
