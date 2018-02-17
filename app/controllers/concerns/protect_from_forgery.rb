module ProtectFromForgery
  extend ActiveSupport::Concern

  included do
    protect_from_forgery with: :exception, prepend: true
  end
end
