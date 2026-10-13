class VirtualCompetition < ApplicationRecord
  module MultiDiscipline
    extend ActiveSupport::Concern

    included do
      has_many :disciplines, -> { order(:position) },
               class_name: 'VirtualCompetition::Discipline', inverse_of: :virtual_competition, dependent: :destroy

      accepts_nested_attributes_for :disciplines,
                                    allow_destroy: true, reject_if: ->(attrs) { attrs['discipline'].blank? }

      validate :several_disciplines_or_none
    end

    def multi_discipline? = disciplines.load.size > 1

    def multi_discipline_standings = MultiDisciplineStandings.new(self)

    private

    def several_disciplines_or_none
      return unless disciplines.reject(&:marked_for_destruction?).one?

      errors.add(:disciplines, :single)
    end
  end
end
