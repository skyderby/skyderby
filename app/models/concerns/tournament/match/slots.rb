class Tournament < ApplicationRecord
  class Match < ApplicationRecord
    module Slots
      extend ActiveSupport::Concern

      included do
        has_many :slots, -> { order(:is_disqualified, :result) }, dependent: :destroy, inverse_of: :match
        accepts_nested_attributes_for :slots
        before_create :build_slots
      end

      def free_slots
        tournament.bracket_size - slots.count
      end

      private

      def build_slots
        free_slots.times do
          slots.build
        end
      end
    end
  end
end
