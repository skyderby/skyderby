module Api
  module Users
    class RegistrationsController < Devise::RegistrationsController
      clear_respond_to
      respond_to :json
    end
  end
end
