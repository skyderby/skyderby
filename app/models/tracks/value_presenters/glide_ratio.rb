module Tracks
  module ValuePresenters
    class GlideRatio
      def call(value)
        value.round(2)
      end
    end
  end
end
