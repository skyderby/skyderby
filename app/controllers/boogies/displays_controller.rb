module Boogies
  class DisplaysController < ApplicationController
    include BoogieContext

    layout 'display'

    before_action :set_event, :authorize_event_access!

    def show
      response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'

      @display = Boogie::Display.new(@event)
    end
  end
end
