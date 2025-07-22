class Boogies::Results::MapsController < ApplicationController
  include BoogieContext

  before_action :set_event
  before_action :authorize_event_access!

  def show
    @result = @event.results.find(params[:result_id])
  end
end
