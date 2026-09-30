module Api
  module V1
    module Profiles
      class OverviewsController < Api::ApplicationController
        def show
          @dashboard = ::Profiles::Dashboard.new(
            Profile.find(params[:profile_id]),
            user: current_user,
            mode: params[:mode],
            rankings_gender: params[:rankings_gender],
            modes: DashboardsController::MODES
          )
          @public_overview = true
          render 'api/v1/dashboards/show'
        end
      end
    end
  end
end
