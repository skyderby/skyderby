module GlobalErrorHandling
  extend ActiveSupport::Concern

  included do
    rescue_from Pundit::NotAuthorizedError do |_excp|
      respond_to do |format|
        format.html { render file: 'public/403.html', status: :forbidden, layout: false }
        format.json { render json: { error: 'forbidden' }, status: :forbidden }
      end
    end

    rescue_from ActionController::InvalidAuthenticityToken do |_excp|
      respond_to do |format|
        format.json do
          render json: { errors: { general: 'Invalid authenticity token' } },
                 status: :unprocessable_entity
        end
      end
    end
  end
end
