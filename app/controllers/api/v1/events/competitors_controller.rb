module Api
  module V1
    module Events
      class CompetitorsController < ApplicationController
        def index
          event = Event.find(params[:event_id])

          authorize event, :show?

          @competitors = event.competitors

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
