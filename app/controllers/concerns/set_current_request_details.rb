module SetCurrentRequestDetails
  extend ActiveSupport::Concern

  included do
    before_action do
      Current.user = current_user
      Current.charts_mode = session[:preferred_charts_mode]
      Current.charts_units = session[:preferred_charts_units]
    end
  end
end
