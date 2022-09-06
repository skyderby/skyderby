module Api
  module Users
    class PasswordsController < Devise::PasswordsController
      include UnderscoreParams

      clear_respond_to
      respond_to :json
    end
  end
end
