class PerformanceCompetition < ApplicationRecord
  module Namespace
    extend ActiveSupport::Concern

    class_methods do
      def model_name
        ActiveModel::Name.new(self, PerformanceCompetition)
      end
    end
  end
end
