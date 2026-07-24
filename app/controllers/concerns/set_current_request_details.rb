module SetCurrentRequestDetails
  extend ActiveSupport::Concern

  included do
    before_action do
      Current.user = current_user
      Current.charts_mode = session[:preferred_charts_mode]

      Current.charts_units =
        Current.default_units || session[:preferred_charts_units]
      Current.speed_skydiving_units =
        Current.default_speed_skydiving_units || session[:preferred_speed_skydiving_units]
    end
  end
end
