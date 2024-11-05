class Api::Web::Users::PasswordsController < Devise::PasswordsController
  include UnderscoreParams

  clear_respond_to
  respond_to :json
end
