class ReactAppController < ApplicationController
  layout 'react_app'

  def show; end

  def allow_iframe
    response.headers['X-Frame-Options'] = 'ALLOWALL'

    render :show
  end
end
