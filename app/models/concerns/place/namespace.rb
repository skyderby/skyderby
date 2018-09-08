class Place < ApplicationRecord
  module Namespace
    extend ActiveSupport::Concern

    class_methods do
      def model_name
        ActiveModel::Name.new(self, Place)
      end
    end
  end
end
