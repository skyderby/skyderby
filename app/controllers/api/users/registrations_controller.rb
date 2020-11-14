module Api
  module Users
    class RegistrationsController < Devise::RegistrationsController
      include UnderscoreParams
      include GlobalErrorHandling

      # rubocop:disable Rails/LexicallyScopedActionFilter
      after_action :set_new_csrf_token, only: %i[create update destroy]
      # rubocop:enable Rails/LexicallyScopedActionFilter

      clear_respond_to
      respond_to :json

      private

      def set_new_csrf_token
        response.set_header('New-CSRF-Token', form_authenticity_token)
      end
    end
  end
end
