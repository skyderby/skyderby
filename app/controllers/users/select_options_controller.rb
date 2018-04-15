module Users
  class SelectOptionsController < ApplicationController
    def index
      @users = User.includes(:profile)
                   .left_outer_joins(:profile)
                   .search_by_name(search_query)
                   .select('users.id', 'profiles.name')
                   .order('profiles.name')
                   .paginate(page: page, per_page: 25)
    end

    private

    def search_query
      params[:term]
    end

    def page
      params[:page]
    end
  end
end
