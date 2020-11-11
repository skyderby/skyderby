class ApplicationController < ActionController::Base
  include SetCurrentRequestDetails

  include Pundit
  include MobileFormatOverride
  include ConditionalGet

  include ProtectFromForgery
  include Internationalization

  include DeviseOverrides
  include GlobalErrorHandling

  include RackMiniProfiler

  layout :layout_by_resource

  def layout_by_resource
    if devise_controller?
      'sessions'
    else
      'application'
    end
  end
end
