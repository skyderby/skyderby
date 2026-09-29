module Api
  module V1
    module Admin
      class UsersController < Api::ApplicationController
        LIMIT = 20

        before_action -> { doorkeeper_authorize! }
        before_action :forbid_impersonation!, :require_admin!

        def index
          @users = User.left_outer_joins(:profile).search(params[:term].to_s.strip)
                       .includes(profile: :country)
                       .order(Arel.sql('profiles.name ASC NULLS LAST'), :id)
                       .limit(LIMIT)
        end
      end
    end
  end
end
