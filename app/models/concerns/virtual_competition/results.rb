class VirtualCompetition < ApplicationRecord
  module Results
    extend ActiveSupport::Concern

    included do
      has_many :results, dependent: :delete_all

      before_save :set_results_sort_order
    end

    private

    def set_results_sort_order
      self.results_sort_order = VirtualCompetition.results_sort_order_for(discipline)
    end
  end
end
