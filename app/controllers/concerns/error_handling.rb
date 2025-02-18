module ErrorHandling
  extend ActiveSupport::Concern

  included do
    rescue_from Pundit::NotAuthorizedError do |_excp|
      respond_not_authorized
    end
  end

  def respond_not_authorized
    respond_to do |format|
      format.html { render file: 'public/403.html', status: :forbidden, layout: false }
      format.json { render json: '{ "error": "forbidden" }', status: :forbidden }
      format.turbo_stream do
        render turbo_stream: turbo_stream.append(
          :toasts,
          partial: 'toasts/toast',
          locals: { message: "You're not authorized to perform this action" }
        )
      end
    end
  end

  def respond_with_errors(object)
    render turbo_stream: turbo_stream.append(
      :toasts,
      partial: 'toasts/toast',
      locals: {
        message: I18n.t(
          'errors.messages.not_saved',
          count: object.errors.count,
          resource: object.model_name.element
        ),
        type: 'error',
        errors: object.errors.full_messages
      }
    )
  end
end
