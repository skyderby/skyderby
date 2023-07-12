class Api::CsrfController < Api::ApplicationController
  def show
    render json: { csrf: form_authenticity_token }
  end
end
