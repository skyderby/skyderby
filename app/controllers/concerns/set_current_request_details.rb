module SetCurrentRequestDetails
  extend ActiveSupport::Concern

  included do
    before_action do
      Current.user = current_user
      Current.charts_mode = session[:preferred_charts_mode]
    end
  end
end
