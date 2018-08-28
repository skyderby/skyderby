module Api
  module V1
    module Events
      class CompetitorsController < Api::ApplicationController
        def index
          event = Event.find(params[:event_id])

          authorize event, :show?

          @competitors =
            event.competitors
                 .left_outer_joins(:section, :profile)
                 .order('event_sections.order', 'profiles.name')

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
