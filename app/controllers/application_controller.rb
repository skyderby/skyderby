class ApplicationController < ActionController::Base
  include DeviseOverrides
  include SetCurrentRequestDetails
  include Pundit
  include ProtectFromForgery
  include Internationalization
  include GlobalErrorHandling
end
