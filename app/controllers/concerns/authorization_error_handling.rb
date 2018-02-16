module AuthorizationErrorHandling
  extend ActiveSupport::Concern

  included do
    rescue_from Pundit::NotAuthorizedError do |_excp|
      respond_to do |format|
        format.html { render file: 'public/403.html', status: :forbidden, layout: false }
        format.json { render json: '{ "error": "forbidden" }', status: :forbidden }
      end
    end
  end
end
