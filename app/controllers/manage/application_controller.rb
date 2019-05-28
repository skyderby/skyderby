module Manage
  class ApplicationController < ::ApplicationController
    before_action :ensure_permissions

    def ensure_permissions
      return if ManagePolicy.new(current_user).manage?

      raise Pundit::NotAuthorizedError, 'You are not allowed to access this page'
    end
  end
end
