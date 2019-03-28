module Api
  module V1
    module Stats
      class RegistrationsController < Api::ApplicationController
        def index
          @registrations =
            User
            .select(
              "date_trunc('month', created_at) AS month",
              'count(id) AS count'
            )
            .group("date_trunc('month', created_at)")
            .order("date_trunc('month', created_at)")

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
