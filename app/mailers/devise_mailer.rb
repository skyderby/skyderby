class DeviseMailer < Devise::Mailer
  helper :application
  include Devise::Controllers::UrlHelpers

  layout 'mailer'
end
