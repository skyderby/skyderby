class VirtualCompetition < ApplicationRecord
  module Results
    extend ActiveSupport::Concern

    included do
      has_many :results, dependent: :delete_all
      has_many :personal_top_scores  # rubocop:disable Rails/HasManyOrHasOneDependent
      has_many :annual_top_scores    # rubocop:disable Rails/HasManyOrHasOneDependent
      has_many :interval_top_scores  # rubocop:disable Rails/HasManyOrHasOneDependent

      before_save :set_results_sort_order
    end

    private

    def set_results_sort_order
      self.results_sort_order = base_race? ? :ascending : :descending
    end
  end
end
