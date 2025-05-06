module Tracks
  module ValuePresenters
    class GlideRatio
      def call(value)
        return 0 if value.nil? || 
                    (value.is_a?(Float) && (value.nan? || value.infinite?))

        value.round(2)
      end
    end
  end
end
