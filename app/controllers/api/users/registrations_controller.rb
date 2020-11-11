module Api
  module Users
    class RegistrationsController < Devise::RegistrationsController
      include UnderscoreParams
      include GlobalErrorHandling

      after_action :set_new_csrf_token, only: %i[create update destroy]

      clear_respond_to
      respond_to :json

      private

      def set_new_csrf_token
        response.set_header('New-CSRF-Token', form_authenticity_token)
      end
    end
  end
end
