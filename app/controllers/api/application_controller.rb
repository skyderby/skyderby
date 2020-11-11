module Api
  class ApplicationController < ::ApplicationController
    include UnderscoreParams
    include GlobalErrorHandling

    skip_before_action :verify_authenticity_token

    private

    def current_page
      [params[:page].to_i, 1].max
    end

    def rows_per_page
      params[:per_page]
        .to_i
        .then { |per_page| per_page.positive? ? per_page : 25 }
        .then { |per_page| [per_page, 100].min }
    end
  end
end
