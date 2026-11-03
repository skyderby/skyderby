module Logbook
  class DashboardTilesController < ApplicationController
    include LogbookScoped

    def update
      Current.user.setting.update!(dashboard_logbook: params.require(:visible))

      redirect_back_or_to root_path, status: :see_other
    end
  end
end
