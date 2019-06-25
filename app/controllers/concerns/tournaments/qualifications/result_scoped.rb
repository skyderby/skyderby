module Tournaments
  module Qualifications
    module ResultScoped
      extend ActiveSupport::Concern

      included do
        before_action :set_result
      end

      def set_result
        @result = @tournament.qualification_jumps.find(params[:result_id])
      end
    end
  end
end
