class Event < ApplicationRecord
  module Namespace
    extend ActiveSupport::Concern

    class_methods do
      def model_name
        ActiveModel::Name.new(self, Event)
      end
    end
  end
end
