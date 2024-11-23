module ErrorHandling
  extend ActiveSupport::Concern

  included do
    rescue_from Pundit::NotAuthorizedError do |_excp|
      respond_to do |format|
        format.html { render file: 'public/403.html', status: :forbidden, layout: false }
        format.json { render json: '{ "error": "forbidden" }', status: :forbidden }
      end
    end
  end

  def respond_with_errors(object)
    render turbo_stream: turbo_stream.append(
      :toasts,
      partial: 'toasts/toast',
      locals: {
        message: I18n.t('errors.messages.not_saved', count: object.errors),
        type: 'error',
        errors: object.errors.full_messages
      }
    )
  end
end
