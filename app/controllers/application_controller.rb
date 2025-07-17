class ApplicationController < ActionController::Base
  include DeviseOverrides
  include ErrorHandling

  include SetCurrentRequestDetails

  include Pundit::Authorization
  include MobileFormatOverride
  include ConditionalGet

  include ProtectFromForgery
  include Internationalization

  include CurrentAnnouncements
  include OrderParams

  layout :layout_by_resource

  before_action :underscore_params!

  def layout_by_resource
    if devise_controller?
      'sessions'
    else
      'application'
    end
  end

  def page = [params[:page].to_i, 1].max

  def underscore_params!
    params.deep_transform_keys!(&:underscore)
  end
end
