class ApplicationController < ActionController::Base
  include Pundit
  include MobileFormatOverride

  include ProtectFromForgery
  include Internationalization

  include DeviseOverrides
  include AuthorizationErrorHandling

  include RackMiniProfiler
end
