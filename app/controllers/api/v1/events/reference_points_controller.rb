module Api
  module V1
    module Events
      class ReferencePointsController < ApplicationController
        before_action :set_event

        def index
          authorize @event, :show?
          @reference_points = @event.reference_points
        end

        private

        def set_event
          @event = Event.find(params[:event_id])
        end
      end
    end
  end
end
