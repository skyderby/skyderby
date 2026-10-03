module Api
  module BoogieScoped
    extend ActiveSupport::Concern

    included do
      before_action :set_event
    end

    private

    def set_event
      @event = Boogie.includes(place: :country).find(params[:boogie_id])
      raise ActiveRecord::RecordNotFound unless @event.viewable?
    end
  end
end
