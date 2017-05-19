module Manage
  class DashboardsController < ApplicationController
    def show
      @dashboard = Dashboard.new
    end
  end
end
