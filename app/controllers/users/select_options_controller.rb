class Users::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @users = User.includes(:profile)
                 .left_outer_joins(:profile)
                 .search_by_name(search_query)
                 .select('users.id', 'profiles.name')
                 .order('profiles.name')
                 .paginate(page:, per_page: 25)

    respond_with_no_results(params[:frame_id]) if @users.empty? && @users.current_page == 1
  end

  private

  def search_query
    params[:term]
  end
end
